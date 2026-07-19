/**
 * Installment engine (spec §9) — PURE functions, no DB, fully unit-testable.
 *
 *   financed        = salePrice − downPayment
 *   perInstallment  = round(financed / n, 2)            (rounded to the poisha)
 *   schedule[i].due = perInstallment           (i = 1 … n−1)
 *   schedule[n].due = financed − perInstallment × (n−1) // last absorbs remainder
 *
 * dueDate: `installmentStartDate` is the date the FIRST installment is due, so
 * installment i is due (i−1) months after the start date. This matches the
 * field name ("start date" = first due date); the spec's "+ i months" phrasing
 * is the same schedule shifted by one, and is called out here on purpose.
 */
import { divideRounded, multiply, type Poisha } from '@/lib/money';

export type InstallmentStatus = 'PENDING' | 'PARTIAL' | 'PAID' | 'OVERDUE';

export interface ScheduleInput {
  salePrice: Poisha;
  downPayment: Poisha;
  installmentCount: number;
  startDate: Date;
}

export interface ScheduleRow {
  installmentNo: number;
  dueDate: Date;
  amountDue: Poisha;
}

/** Add whole months to a date, clamping the day to the target month's last day. */
export function addMonths(date: Date, months: number): Date {
  const d = new Date(date.getTime());
  const targetMonth = d.getMonth() + months;
  const result = new Date(d.getFullYear(), targetMonth, 1);
  const lastDay = new Date(result.getFullYear(), result.getMonth() + 1, 0).getDate();
  result.setDate(Math.min(d.getDate(), lastDay));
  result.setHours(d.getHours(), d.getMinutes(), d.getSeconds(), d.getMilliseconds());
  return result;
}

/** Generate the installment schedule. The last row absorbs any rounding remainder. */
export function generateSchedule(input: ScheduleInput): ScheduleRow[] {
  const { salePrice, downPayment, installmentCount, startDate } = input;
  if (installmentCount <= 0) throw new Error('installmentCount must be positive');

  const financed = salePrice - downPayment;
  if (financed < 0n) throw new Error('downPayment cannot exceed salePrice');

  const per = divideRounded(financed, installmentCount);
  const rows: ScheduleRow[] = [];

  for (let i = 1; i <= installmentCount; i++) {
    const isLast = i === installmentCount;
    const amountDue = isLast ? financed - multiply(per, installmentCount - 1) : per;
    rows.push({
      installmentNo: i,
      dueDate: addMonths(startDate, i - 1),
      amountDue,
    });
  }
  return rows;
}

/** Compute an installment's status. OVERDUE takes precedence over PARTIAL when past due. */
export function computeStatus(
  amountDue: Poisha,
  amountPaid: Poisha,
  dueDate: Date,
  asOf: Date = new Date(),
): InstallmentStatus {
  if (amountPaid >= amountDue) return 'PAID';
  if (startOfDay(dueDate) < startOfDay(asOf)) return 'OVERDUE';
  if (amountPaid > 0n) return 'PARTIAL';
  return 'PENDING';
}

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export interface AllocationTarget {
  installmentId: string;
  installmentNo: number;
  amountDue: Poisha;
  amountPaid: Poisha;
}

export interface Allocation {
  installmentId: string;
  applied: Poisha;
}

export interface AllocationResult {
  allocations: Allocation[];
  /** Amount that could not be placed on any scheduled installment (advance/overpay). */
  surplus: Poisha;
}

/**
 * Allocate a payment across installments, oldest-unpaid first, carrying surplus
 * forward (spec §6.5). `targets` must be sorted ascending by installmentNo.
 */
export function allocatePayment(amount: Poisha, targets: AllocationTarget[]): AllocationResult {
  if (amount < 0n) throw new Error('Payment amount cannot be negative');
  let remaining = amount;
  const allocations: Allocation[] = [];

  for (const t of targets) {
    if (remaining <= 0n) break;
    const room = t.amountDue - t.amountPaid;
    if (room <= 0n) continue;
    const applied = remaining < room ? remaining : room;
    allocations.push({ installmentId: t.installmentId, applied });
    remaining -= applied;
  }

  return { allocations, surplus: remaining };
}
