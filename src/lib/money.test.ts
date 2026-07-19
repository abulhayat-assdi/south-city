import { describe, it, expect } from 'vitest';
import {
  toPoisha,
  toDecimalString,
  divideRounded,
  multiply,
  sum,
  formatBDT,
} from './money';

describe('money — parsing & formatting', () => {
  it('parses whole taka', () => {
    expect(toPoisha('1250000')).toBe(125000000n);
    expect(toPoisha(1250000)).toBe(125000000n);
  });

  it('parses taka with poisha', () => {
    expect(toPoisha('1250000.50')).toBe(125000050n);
    expect(toPoisha('0.01')).toBe(1n);
    expect(toPoisha('0.1')).toBe(10n);
  });

  it('rounds a 3rd decimal half-up', () => {
    expect(toPoisha('1.005')).toBe(101n); // 1.005 -> 1.01
    expect(toPoisha('1.004')).toBe(100n); // 1.004 -> 1.00
  });

  it('round-trips through a decimal string', () => {
    expect(toDecimalString(125000050n)).toBe('1250000.50');
    expect(toDecimalString(1n)).toBe('0.01');
    expect(toDecimalString(0n)).toBe('0.00');
  });

  it('rejects garbage input', () => {
    expect(() => toPoisha('abc')).toThrow();
    expect(() => toPoisha('1,250,000')).toThrow();
  });

  it('formats BDT with lakh/crore grouping', () => {
    expect(formatBDT('1250000')).toMatch(/12,50,000/);
    expect(formatBDT('12500000')).toMatch(/1,25,00,000/);
  });
});

describe('money — arithmetic', () => {
  it('divides with round-half-up', () => {
    expect(divideRounded(100n, 3)).toBe(33n); // 33.33 -> 33
    expect(divideRounded(101n, 3)).toBe(34n); // 33.67 -> 34
    expect(divideRounded(150n, 4)).toBe(38n); // 37.5 -> 38 (half up)
  });

  it('multiplies and sums exactly', () => {
    expect(multiply(33n, 3)).toBe(99n);
    expect(sum([10n, 20n, 30n])).toBe(60n);
  });

  it('has no float error on large sums', () => {
    // 100 crore taka = 1,000,000,000.00 = 100_000_000_000 poisha.
    // Adding 1 poisha a hundred times (= 1.00 taka) stays exact — no float drift.
    let acc = toPoisha('1000000000.00');
    expect(acc).toBe(100_000_000_000n);
    for (let i = 0; i < 100; i++) acc += 1n;
    expect(toDecimalString(acc)).toBe('1000000001.00');
  });
});
