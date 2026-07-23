'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/db';
import { assertPermission } from '@/server/session';
import { writeAudit } from '@/lib/audit';
import { nextReceiptNo } from '@/lib/codes';
import { paymentSchema } from '@/lib/validators/payment';
import { recomputeSale } from '@/server/services/payments';
import { toPoisha, toDecimalString } from '@/lib/money';

export interface PaymentActionState {
  error?: string;
  ok?: boolean;
  receiptNo?: string;
}

/** Record a manually-collected payment (spec §8/§11). Never processes money —
 * it only records a payment made offline. */
export async function recordPayment(_prev: PaymentActionState, formData: FormData): Promise<PaymentActionState> {
  const user = await assertPermission('payment:record');
  const parsed = paymentSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };
  const d = parsed.data;

  const sale = await prisma.sale.findUnique({ where: { id: d.saleId }, select: { id: true, status: true } });
  if (!sale) return { error: 'বিক্রয় পাওয়া যায়নি' };
  if (sale.status === 'CANCELLED') return { error: 'বাতিল হওয়া বিক্রয়ে পেমেন্ট রেকর্ড করা যাবে না' };

  const amount = toPoisha(d.amount);
  let receiptNo = '';
  await prisma.$transaction(async (tx) => {
    receiptNo = await nextReceiptNo(tx);
    const payment = await tx.payment.create({
      data: {
        receiptNo,
        saleId: d.saleId,
        installmentId: d.installmentId || null,
        amount: toDecimalString(amount),
        paymentDate: new Date(d.paymentDate),
        method: d.method,
        referenceNo: d.referenceNo || null,
        note: d.note || null,
        recordedById: user.id,
      },
    });
    // Recompute installments + sale/plot rollup from all non-voided payments.
    await recomputeSale(tx, d.saleId);
    await writeAudit(tx, { userId: user.id, action: 'RECORD_PAYMENT', entity: 'Payment', entityId: payment.id, after: payment });
  });

  revalidatePath(`/admin/sales/${d.saleId}`);
  revalidatePath('/admin/payments');
  return { ok: true, receiptNo };
}

/** Void a payment (ADMIN only). Payments are never deleted (spec §8). */
export async function voidPayment(paymentId: string, reason: string): Promise<{ error?: string; ok?: boolean }> {
  const user = await assertPermission('payment:void');
  if (!reason || reason.trim().length < 3) return { error: 'ভয়েডের কারণ লিখুন' };

  const payment = await prisma.payment.findUnique({ where: { id: paymentId } });
  if (!payment) return { error: 'পেমেন্ট পাওয়া যায়নি' };
  if (payment.isVoided) return { error: 'ইতিমধ্যে ভয়েড করা হয়েছে' };

  await prisma.$transaction(async (tx) => {
    await tx.payment.update({
      where: { id: paymentId },
      data: { isVoided: true, voidReason: reason.trim(), voidedAt: new Date(), voidedById: user.id },
    });
    await recomputeSale(tx, payment.saleId);
    await writeAudit(tx, {
      userId: user.id,
      action: 'VOID_PAYMENT',
      entity: 'Payment',
      entityId: paymentId,
      before: { amount: payment.amount.toString(), isVoided: false },
      after: { isVoided: true, reason },
    });
  });

  revalidatePath(`/admin/sales/${payment.saleId}`);
  revalidatePath('/admin/payments');
  return { ok: true };
}
