import { describe, it, expect } from 'vitest';
import {
  generateSchedule,
  computeStatus,
  allocatePayment,
  addMonths,
  type AllocationTarget,
} from './installments';
import { toPoisha, sum, toDecimalString } from '@/lib/money';

describe('generateSchedule', () => {
  it('splits evenly when divisible, last row absorbs remainder', () => {
    const rows = generateSchedule({
      salePrice: toPoisha('1200000'),
      downPayment: toPoisha('0'),
      installmentCount: 12,
      startDate: new Date(2026, 0, 1),
    });
    expect(rows).toHaveLength(12);
    expect(rows.every((r) => r.amountDue === toPoisha('100000'))).toBe(true);
    // total must equal financed exactly
    expect(sum(rows.map((r) => r.amountDue))).toBe(toPoisha('1200000'));
  });

  it('puts the rounding remainder on the LAST installment', () => {
    // financed = 1,000,000 over 3 => 333,333.33 each, last = 333,333.34
    const rows = generateSchedule({
      salePrice: toPoisha('1000000'),
      downPayment: toPoisha('0'),
      installmentCount: 3,
      startDate: new Date(2026, 0, 15),
    });
    expect(toDecimalString(rows[0].amountDue)).toBe('333333.33');
    expect(toDecimalString(rows[1].amountDue)).toBe('333333.33');
    expect(toDecimalString(rows[2].amountDue)).toBe('333333.34');
    expect(sum(rows.map((r) => r.amountDue))).toBe(toPoisha('1000000'));
  });

  it('subtracts the down payment from the financed total', () => {
    const rows = generateSchedule({
      salePrice: toPoisha('5000000'),
      downPayment: toPoisha('500000'),
      installmentCount: 60,
      startDate: new Date(2026, 5, 1),
    });
    expect(rows).toHaveLength(60);
    expect(sum(rows.map((r) => r.amountDue))).toBe(toPoisha('4500000'));
  });

  it('first installment is due on the start date, then monthly', () => {
    const rows = generateSchedule({
      salePrice: toPoisha('300000'),
      downPayment: toPoisha('0'),
      installmentCount: 3,
      startDate: new Date(2026, 0, 31), // Jan 31
    });
    expect(rows[0].dueDate).toEqual(new Date(2026, 0, 31));
    expect(rows[1].dueDate).toEqual(new Date(2026, 1, 28)); // Feb clamps to 28
    expect(rows[2].dueDate).toEqual(new Date(2026, 2, 31));
  });

  it('rejects a down payment larger than the price', () => {
    expect(() =>
      generateSchedule({
        salePrice: toPoisha('100'),
        downPayment: toPoisha('200'),
        installmentCount: 2,
        startDate: new Date(),
      }),
    ).toThrow();
  });
});

describe('computeStatus', () => {
  const due = toPoisha('100000');
  const asOf = new Date(2026, 5, 15);

  it('PAID when fully paid regardless of date', () => {
    expect(computeStatus(due, due, new Date(2020, 0, 1), asOf)).toBe('PAID');
    expect(computeStatus(due, toPoisha('100001'), new Date(2020, 0, 1), asOf)).toBe('PAID');
  });

  it('OVERDUE beats PARTIAL when past due and not fully paid', () => {
    expect(computeStatus(due, toPoisha('40000'), new Date(2026, 4, 1), asOf)).toBe('OVERDUE');
    expect(computeStatus(due, 0n, new Date(2026, 4, 1), asOf)).toBe('OVERDUE');
  });

  it('PARTIAL when some paid and not yet due', () => {
    expect(computeStatus(due, toPoisha('40000'), new Date(2026, 6, 1), asOf)).toBe('PARTIAL');
  });

  it('PENDING when nothing paid and not yet due', () => {
    expect(computeStatus(due, 0n, new Date(2026, 6, 1), asOf)).toBe('PENDING');
  });
});

describe('allocatePayment', () => {
  const targets = (): AllocationTarget[] => [
    { installmentId: 'i1', installmentNo: 1, amountDue: toPoisha('100000'), amountPaid: 0n },
    { installmentId: 'i2', installmentNo: 2, amountDue: toPoisha('100000'), amountPaid: 0n },
    { installmentId: 'i3', installmentNo: 3, amountDue: toPoisha('100000'), amountPaid: 0n },
  ];

  it('fills the oldest installment first', () => {
    const { allocations, surplus } = allocatePayment(toPoisha('100000'), targets());
    expect(allocations).toEqual([{ installmentId: 'i1', applied: toPoisha('100000') }]);
    expect(surplus).toBe(0n);
  });

  it('carries an advance across multiple installments', () => {
    const { allocations, surplus } = allocatePayment(toPoisha('250000'), targets());
    expect(allocations).toEqual([
      { installmentId: 'i1', applied: toPoisha('100000') },
      { installmentId: 'i2', applied: toPoisha('100000') },
      { installmentId: 'i3', applied: toPoisha('50000') },
    ]);
    expect(surplus).toBe(0n);
  });

  it('completes a partially-paid installment before moving on', () => {
    const t = targets();
    t[0].amountPaid = toPoisha('60000');
    const { allocations } = allocatePayment(toPoisha('50000'), t);
    expect(allocations).toEqual([
      { installmentId: 'i1', applied: toPoisha('40000') },
      { installmentId: 'i2', applied: toPoisha('10000') },
    ]);
  });

  it('reports surplus when payment exceeds all remaining dues', () => {
    const { surplus } = allocatePayment(toPoisha('400000'), targets());
    expect(surplus).toBe(toPoisha('100000'));
  });
});

describe('addMonths edge cases', () => {
  it('clamps to end of a shorter month', () => {
    expect(addMonths(new Date(2026, 0, 31), 1)).toEqual(new Date(2026, 1, 28));
    expect(addMonths(new Date(2024, 0, 31), 1)).toEqual(new Date(2024, 1, 29)); // leap year
  });
});
