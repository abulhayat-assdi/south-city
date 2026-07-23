import 'server-only';
import type { Prisma, PrismaClient } from '@prisma/client';
import { toPoisha, toDecimalString, sum } from '@/lib/money';
import { allocatePayment, computeStatus, type AllocationTarget } from './installments';

type Tx = Prisma.TransactionClient | PrismaClient;

/**
 * -----------------------------------------------------------------------------
 * 🔧 INSTALLMENT / PAYMENT POLICY LIVES HERE (spec §11, §21).
 * -----------------------------------------------------------------------------
 * Default policy implemented (owner may change later):
 *   • No late fee.
 *   • No grace period (an unpaid installment is OVERDUE the day after its due date).
 *   • Cancellation simply releases the plot back to AVAILABLE; refunds are handled
 *     offline (this system only records what was actually collected).
 * All amounts are exact integer poisha — never Float.
 */

/**
 * Recompute a sale's derived financial state from its NON-VOIDED payments and
 * persist it (spec §4 money rules, §11 engine):
 *   1. Sum all non-voided payments for the sale.
 *   2. Allocate that total across installments oldest-first, updating each
 *      installment's amountPaid + status.
 *   3. When total paid ≥ salePrice → Sale COMPLETED and plot SOLD.
 *      Otherwise, for a non-cancelled sale, keep it ACTIVE and the plot BOOKED.
 * Call inside the same transaction as the payment change.
 */
export async function recomputeSale(tx: Tx, saleId: string): Promise<void> {
  const sale = await tx.sale.findUnique({
    where: { id: saleId },
    include: {
      installments: { orderBy: { installmentNo: 'asc' } },
      payments: { where: { isVoided: false } },
    },
  });
  if (!sale) return;
  if (sale.status === 'CANCELLED') return; // cancelled sales are frozen

  const salePrice = toPoisha(sale.salePrice.toString());
  const totalPaid = sum(sale.payments.map((p) => toPoisha(p.amount.toString())));

  // ---- Allocate across installments, oldest-first ----
  if (sale.installments.length > 0) {
    const targets: AllocationTarget[] = sale.installments.map((i) => ({
      installmentId: i.id,
      installmentNo: i.installmentNo,
      amountDue: toPoisha(i.amountDue.toString()),
      amountPaid: 0n, // fresh allocation of the full paid total
    }));
    const { allocations } = allocatePayment(totalPaid, targets);
    const appliedById = new Map(allocations.map((a) => [a.installmentId, a.applied]));

    for (const inst of sale.installments) {
      const applied = appliedById.get(inst.id) ?? 0n;
      const due = toPoisha(inst.amountDue.toString());
      const status = computeStatus(due, applied, inst.dueDate);
      await tx.installment.update({
        where: { id: inst.id },
        data: { amountPaid: toDecimalString(applied), status },
      });
    }
  }

  // ---- Roll up sale + plot status ----
  const isFullyPaid = totalPaid >= salePrice;
  await tx.sale.update({
    where: { id: saleId },
    data: { status: isFullyPaid ? 'COMPLETED' : 'ACTIVE' },
  });
  await tx.plot.update({
    where: { id: sale.plotId },
    data: { status: isFullyPaid ? 'SOLD' : 'BOOKED' },
  });
}

/** Convenience totals for a sale, from non-voided payments. */
export async function saleTotals(tx: Tx, saleId: string) {
  const sale = await tx.sale.findUnique({
    where: { id: saleId },
    include: { payments: { where: { isVoided: false } } },
  });
  if (!sale) return null;
  const price = toPoisha(sale.salePrice.toString());
  const paid = sum(sale.payments.map((p) => toPoisha(p.amount.toString())));
  return { price, paid, outstanding: price - paid };
}
