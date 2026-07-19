/**
 * Land-unit helpers (spec §12).
 * Katha is the primary unit. 1 Katha = 720 sq ft ≈ 66.9 m²; 1 Bigha = 20 Katha.
 */
export const SQFT_PER_KATHA = 720;
export const KATHA_PER_BIGHA = 20;

export function kathaToSqft(katha: number): number {
  return katha * SQFT_PER_KATHA;
}

export function kathaToBigha(katha: number): number {
  return katha / KATHA_PER_BIGHA;
}

/** Format a katha value for display, e.g. "5 Katha" / "৫ কাঠা". */
export function formatKatha(katha: number | string | { toString(): string }, lang: 'en' | 'bn' = 'en'): string {
  const n = typeof katha === 'number' ? katha : Number(katha.toString());
  const num = lang === 'bn' ? toBanglaNumerals(n) : String(n);
  return lang === 'bn' ? `${num} কাঠা` : `${num} Katha`;
}

const banglaDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];

export function toBanglaNumerals(value: number | string): string {
  return String(value).replace(/\d/g, (d) => banglaDigits[Number(d)]);
}

/** Standard plot sizes offered by South City. */
export const PLOT_SIZES = [3, 5, 10] as const;
export type PlotSize = (typeof PLOT_SIZES)[number];

/** Sectors A–D. */
export const SECTORS = ['A', 'B', 'C', 'D'] as const;
export type Sector = (typeof SECTORS)[number];
