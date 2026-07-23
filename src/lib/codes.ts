import type { Prisma, PrismaClient } from '@prisma/client';

/**
 * Human-readable sequential codes. Generated inside the same transaction as the
 * row they belong to, so concurrent creates cannot collide.
 *   Customer  SDC-0001
 *   Sale      SALE-2026-0001
 *   Payment   RCP-2026-000123
 */
type Tx = Prisma.TransactionClient | PrismaClient;

function pad(n: number, width: number): string {
  return String(n).padStart(width, '0');
}

export async function nextCustomerCode(tx: Tx): Promise<string> {
  const count = await tx.customer.count();
  return `SDC-${pad(count + 1, 4)}`;
}

export async function nextSaleCode(tx: Tx, year = new Date().getFullYear()): Promise<string> {
  const prefix = `SALE-${year}-`;
  const count = await tx.sale.count({ where: { saleCode: { startsWith: prefix } } });
  return `${prefix}${pad(count + 1, 4)}`;
}

export async function nextReceiptNo(tx: Tx, year = new Date().getFullYear()): Promise<string> {
  const prefix = `RCP-${year}-`;
  const count = await tx.payment.count({ where: { receiptNo: { startsWith: prefix } } });
  return `${prefix}${pad(count + 1, 6)}`;
}
