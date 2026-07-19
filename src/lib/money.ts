/**
 * Money utilities — BDT, always 2 decimal places (spec §4 "Money rules").
 *
 * Internally money is an integer number of **poisha** (1 Taka = 100 poisha)
 * held in a `bigint`. This makes all arithmetic exact — there is never any
 * binary-float rounding error — and lets the installment engine be unit-tested
 * without a database. At the Prisma boundary we convert to/from the DB's
 * `Decimal(14,2)` via a plain decimal string, never via Float.
 *
 * NEVER do money math with JavaScript `number` + `*`/`/`. Use these helpers.
 */

/** A monetary amount in poisha (1/100 of a Taka). */
export type Poisha = bigint;

/** Parse a Taka amount (string like "1250000.50", or a Decimal-like object) into poisha. */
export function toPoisha(value: string | number | bigint | { toString(): string }): Poisha {
  if (typeof value === 'bigint') return value;
  const str = typeof value === 'number' ? value.toString() : value.toString();
  return parseDecimalToPoisha(str);
}

function parseDecimalToPoisha(str: string): Poisha {
  const trimmed = str.trim();
  if (!/^-?\d+(\.\d+)?$/.test(trimmed)) {
    throw new Error(`Invalid money value: "${str}"`);
  }
  const negative = trimmed.startsWith('-');
  const unsigned = negative ? trimmed.slice(1) : trimmed;
  const [whole, fractionRaw = ''] = unsigned.split('.');
  // pad/truncate fraction to exactly 2 digits, rounding half-up on the 3rd digit
  let fraction = fractionRaw;
  if (fraction.length > 2) {
    const keep = fraction.slice(0, 2);
    const nextDigit = fraction.charCodeAt(2) - 48;
    let poishaWhole = BigInt(whole) * 100n + BigInt(keep);
    if (nextDigit >= 5) poishaWhole += 1n;
    return negative ? -poishaWhole : poishaWhole;
  }
  fraction = (fraction + '00').slice(0, 2);
  const result = BigInt(whole) * 100n + BigInt(fraction || '0');
  return negative ? -result : result;
}

/** Convert poisha back to a canonical "12345.67" decimal string for Prisma/DB. */
export function toDecimalString(poisha: Poisha): string {
  const negative = poisha < 0n;
  const abs = negative ? -poisha : poisha;
  const whole = abs / 100n;
  const frac = abs % 100n;
  const fracStr = frac.toString().padStart(2, '0');
  return `${negative ? '-' : ''}${whole.toString()}.${fracStr}`;
}

/** Convert poisha to a JS number of Taka — for charts/aggregation display ONLY, never for money math. */
export function toTakaNumber(poisha: Poisha): number {
  return Number(poisha) / 100;
}

/** Round-half-up integer division of poisha by a positive integer count. */
export function divideRounded(total: Poisha, count: number): Poisha {
  if (count <= 0) throw new Error('Installment count must be positive');
  const n = BigInt(count);
  const negative = total < 0n;
  const abs = negative ? -total : total;
  const q = abs / n;
  const r = abs % n;
  const rounded = r * 2n >= n ? q + 1n : q;
  return negative ? -rounded : rounded;
}

export function multiply(amount: Poisha, factor: number | bigint): Poisha {
  return amount * BigInt(factor);
}

export function sum(amounts: Poisha[]): Poisha {
  return amounts.reduce((a, b) => a + b, 0n);
}

const bdtFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'BDT',
  maximumFractionDigits: 0,
});

const bdtFormatter2 = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'BDT',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/**
 * Format poisha (or a Decimal-like) as "৳ 12,50,000" with lakh/crore grouping (spec §12).
 * By default hides poisha; pass { paisa: true } to show the two decimals.
 */
export function formatBDT(
  value: Poisha | string | number | { toString(): string },
  opts: { paisa?: boolean } = {},
): string {
  const poisha = toPoisha(value as never);
  const taka = Number(poisha) / 100;
  return (opts.paisa ? bdtFormatter2 : bdtFormatter).format(taka);
}
