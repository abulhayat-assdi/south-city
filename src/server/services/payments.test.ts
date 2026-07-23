import { describe, it, expect } from 'vitest';
import { generateSchedule, allocatePayment, computeStatus, type AllocationTarget } from './installments';
import { toPoisha, toDecimalString, type Poisha } from '@/lib/money';

/**
 * These tests exercise the exact pipeline recomputeSale() runs in the DB
 * (generate schedule → allocate the total of non-voided payments oldest-first →
 * recompute each installment's status), but as pure functions so they need no
 * database. See src/server/services/payments.ts.
 */

function recompute(
  schedule: { installmentId: string; installmentNo: number; amountDue: Poisha; dueDate: Date }[],
  totalPaid: Poisha,
  asOf: Date,
) {
  const targets: AllocationTarget[] = schedule.map((s) => ({
    installmentId: s.installmentId,
    installmentNo: s.installmentNo,
    amountDue: s.amountDue,
    amountPaid: 0n,
  }));
  const { allocations } = allocatePayment(totalPaid, targets);
  const applied = new Map(allocations.map((a) => [a.installmentId, a.applied]));
  return schedule.map((s) => {
    const paid = applied.get(s.installmentId) ?? 0n;
    return { no: s.installmentNo, paid, status: computeStatus(s.amountDue, paid, s.dueDate, asOf) };
  });
}

const scheduleOf = (price: string, down: string, n: number, start: Date) =>
  generateSchedule({ salePrice: toPoisha(price), downPayment: toPoisha(down), installmentCount: n, startDate: start })
    .map((r) => ({ installmentId: `i${r.installmentNo}`, installmentNo: r.installmentNo, amountDue: r.amountDue, dueDate: r.dueDate }));

describe('recomputeSale pipeline (pure model)', () => {
  const start = new Date(2026, 0, 1);
  const asOf = new Date(2026, 5, 15); // installments 1..6 are in the past

  it('a partial payment marks the oldest installment PARTIAL, rest PENDING/OVERDUE', () => {
    const sch = scheduleOf('1200000', '0', 12, start); // 100000 each
    const res = recompute(sch, toPoisha('40000'), new Date(2025, 11, 1)); // before any due date
    expect(res[0].status).toBe('PARTIAL');
    expect(res[0].paid).toBe(toPoisha('40000'));
    expect(res[1].status).toBe('PENDING');
  });

  it('an advance payment fills multiple installments oldest-first', () => {
    const sch = scheduleOf('1200000', '0', 12, start);
    const res = recompute(sch, toPoisha('250000'), new Date(2025, 11, 1));
    expect(res[0].paid).toBe(toPoisha('100000'));
    expect(res[1].paid).toBe(toPoisha('100000'));
    expect(res[2].paid).toBe(toPoisha('50000'));
    expect(res[0].status).toBe('PAID');
    expect(res[1].status).toBe('PAID');
    expect(res[2].status).toBe('PARTIAL');
  });

  it('unpaid past-due installments are OVERDUE', () => {
    const sch = scheduleOf('1200000', '0', 12, start);
    const res = recompute(sch, 0n, asOf);
    // installments due on/before Jun 15 (nos 1..6, due Jan..Jun 1) are OVERDUE
    expect(res[0].status).toBe('OVERDUE');
    expect(res[5].status).toBe('OVERDUE');
    expect(res[6].status).toBe('PENDING'); // due Jul 1, future
  });

  it('voiding a payment (lower total) reverts a PAID installment', () => {
    const sch = scheduleOf('1200000', '0', 12, start);
    const before = recompute(sch, toPoisha('100000'), new Date(2025, 11, 1));
    expect(before[0].status).toBe('PAID');
    // void that payment => total drops to 0
    const after = recompute(sch, 0n, new Date(2025, 11, 1));
    expect(after[0].status).toBe('PENDING');
    expect(after[0].paid).toBe(0n);
  });

  it('paying the full financed amount marks every installment PAID', () => {
    const sch = scheduleOf('1000000', '0', 3, start); // 333333.33, .33, .34
    const res = recompute(sch, toPoisha('1000000'), asOf);
    expect(res.every((r) => r.status === 'PAID')).toBe(true);
    // exact reconciliation
    const totalDue = sch.reduce((a, s) => a + s.amountDue, 0n);
    expect(toDecimalString(totalDue)).toBe('1000000.00');
  });
});
