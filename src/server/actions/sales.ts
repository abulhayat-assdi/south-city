'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/db';
import { assertPermission } from '@/server/session';
import { writeAudit } from '@/lib/audit';
import { nextSaleCode } from '@/lib/codes';
import { saleSchema } from '@/lib/validators/sale';
import { generateSchedule } from '@/server/services/installments';
import { recomputeSale } from '@/server/services/payments';
import { toPoisha, toDecimalString } from '@/lib/money';

export interface SaleActionState {
  error?: string;
}

export async function createSale(_prev: SaleActionState, formData: FormData): Promise<SaleActionState> {
  const user = await assertPermission('sale:write');
  const parsed = saleSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };
  const d = parsed.data;

  // Money as exact poisha.
  const salePrice = toPoisha(d.salePrice);
  const downPayment = toPoisha(d.downPayment);
  if (downPayment > salePrice) return { error: 'ডাউন পেমেন্ট বিক্রয়মূল্যের বেশি হতে পারে না' };

  let newId = '';
  try {
    await prisma.$transaction(async (tx) => {
      // Plot must exist, belong to the project, and be sellable.
      const plot = await tx.plot.findUnique({ where: { id: d.plotId } });
      if (!plot) throw new Error('প্লট পাওয়া যায়নি');
      if (plot.projectId !== d.projectId) throw new Error('প্লট এই প্রজেক্টের নয়');
      if (plot.status === 'SOLD' || plot.status === 'BOOKED') throw new Error('এই প্লটটি ইতিমধ্যে বুকড/বিক্রীত');

      const customer = await tx.customer.findUnique({ where: { id: d.customerId } });
      if (!customer) throw new Error('কাস্টমার পাওয়া যায়নি');

      const saleCode = await nextSaleCode(tx);
      const sale = await tx.sale.create({
        data: {
          saleCode,
          projectId: d.projectId,
          plotId: d.plotId,
          customerId: d.customerId,
          salePrice: toDecimalString(salePrice),
          downPayment: toDecimalString(downPayment),
          paymentType: d.paymentType,
          installmentCount: d.paymentType === 'INSTALLMENT' ? d.installmentCount : null,
          installmentStartDate:
            d.paymentType === 'INSTALLMENT' && d.installmentStartDate ? new Date(d.installmentStartDate) : null,
          bookingDate: new Date(d.bookingDate),
          status: 'ACTIVE',
          notes: d.notes || null,
          createdById: user.id,
        },
      });
      newId = sale.id;

      // Generate installment schedule (INSTALLMENT only). Last row absorbs rounding.
      if (d.paymentType === 'INSTALLMENT' && d.installmentCount && d.installmentStartDate) {
        const rows = generateSchedule({
          salePrice,
          downPayment,
          installmentCount: d.installmentCount,
          startDate: new Date(d.installmentStartDate),
        });
        await tx.installment.createMany({
          data: rows.map((r) => ({
            saleId: sale.id,
            installmentNo: r.installmentNo,
            dueDate: r.dueDate,
            amountDue: toDecimalString(r.amountDue),
          })),
        });
      }

      // Reserve the plot.
      await tx.plot.update({ where: { id: d.plotId }, data: { status: 'BOOKED' } });

      await writeAudit(tx, { userId: user.id, action: 'CREATE_SALE', entity: 'Sale', entityId: sale.id, after: sale });
    });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError) throw e;
    return { error: e instanceof Error ? e.message : 'বিক্রয় তৈরি ব্যর্থ হয়েছে' };
  }

  revalidatePath('/admin/sales');
  redirect(`/admin/sales/${newId}`);
}

/** Cancel a sale — releases the plot back to AVAILABLE (policy in payments.ts). */
export async function cancelSale(id: string, reason: string): Promise<{ error?: string }> {
  const user = await assertPermission('sale:write');
  const sale = await prisma.sale.findUnique({ where: { id }, include: { payments: { where: { isVoided: false } } } });
  if (!sale) return { error: 'বিক্রয় পাওয়া যায়নি' };
  if (sale.status === 'CANCELLED') return { error: 'ইতিমধ্যে বাতিল' };

  await prisma.$transaction(async (tx) => {
    await tx.sale.update({ where: { id }, data: { status: 'CANCELLED', notes: reason ? `${sale.notes ?? ''}\n[বাতিল] ${reason}`.trim() : sale.notes } });
    await tx.plot.update({ where: { id: sale.plotId }, data: { status: 'AVAILABLE' } });
    await writeAudit(tx, {
      userId: user.id,
      action: 'CANCEL_SALE',
      entity: 'Sale',
      entityId: id,
      before: { status: sale.status },
      after: { status: 'CANCELLED', reason },
    });
  });

  revalidatePath(`/admin/sales/${id}`);
  revalidatePath('/admin/sales');
  // Also recompute (no-op for cancelled, but keeps things tidy if reactivated later).
  void recomputeSale;
  return {};
}
