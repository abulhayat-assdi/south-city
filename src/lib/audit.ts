import type { Prisma, PrismaClient } from '@prisma/client';

type Tx = Prisma.TransactionClient | PrismaClient;

export interface AuditInput {
  userId: string;
  action: string; // CREATE_SALE, RECORD_PAYMENT, VOID_PAYMENT, ...
  entity: string; // Sale, Payment, Customer, Plot, User
  entityId: string;
  before?: unknown;
  after?: unknown;
  ipAddress?: string | null;
}

/**
 * Append an audit-log row (spec §13). Call inside the same transaction as the
 * change so the log and the change commit or roll back together.
 * JSON is sanitised so Decimal/Date values serialise cleanly.
 */
export async function writeAudit(tx: Tx, input: AuditInput): Promise<void> {
  await tx.auditLog.create({
    data: {
      userId: input.userId,
      action: input.action,
      entity: input.entity,
      entityId: input.entityId,
      before: toJson(input.before),
      after: toJson(input.after),
      ipAddress: input.ipAddress ?? null,
    },
  });
}

function toJson(value: unknown): Prisma.InputJsonValue | undefined {
  if (value === undefined || value === null) return undefined;
  return JSON.parse(
    JSON.stringify(value, (_key, v) => (typeof v === 'bigint' ? v.toString() : v)),
  ) as Prisma.InputJsonValue;
}
