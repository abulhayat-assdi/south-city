import 'server-only';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/db';
import { toPoisha, sum, type Poisha } from '@/lib/money';

/** Optional project scope for every report/KPI (spec §12). */
export type ProjectScope = string | null;

function projWhere<T extends { projectId?: string }>(scope: ProjectScope, extra: T = {} as T) {
  return scope ? { ...extra, projectId: scope } : extra;
}

// ------------------------------------------------------------------- KPIs
export async function dashboardKpis(scope: ProjectScope) {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  const plotWhere: Prisma.PlotWhereInput = scope ? { projectId: scope } : {};
  const [plotsByStatus, soldThisMonth, collectionAgg, priceAgg, paidAgg, overdueCount, recentPayments] =
    await Promise.all([
      prisma.plot.groupBy({ by: ['status'], where: plotWhere, _count: true }),
      prisma.sale.count({ where: { ...projWhere(scope), bookingDate: { gte: monthStart, lt: monthEnd } } }),
      prisma.payment.aggregate({
        where: {
          isVoided: false,
          paymentDate: { gte: monthStart, lt: monthEnd },
          ...(scope ? { sale: { projectId: scope } } : {}),
        },
        _sum: { amount: true },
      }),
      prisma.sale.aggregate({ where: { ...projWhere(scope), status: { not: 'CANCELLED' } }, _sum: { salePrice: true } }),
      prisma.payment.aggregate({
        where: { isVoided: false, sale: { status: { not: 'CANCELLED' }, ...(scope ? { projectId: scope } : {}) } },
        _sum: { amount: true },
      }),
      prisma.installment.count({
        where: { status: 'OVERDUE', ...(scope ? { sale: { projectId: scope } } : {}) },
      }),
      prisma.payment.findMany({
        where: { isVoided: false, ...(scope ? { sale: { projectId: scope } } : {}) },
        orderBy: [{ paymentDate: 'desc' }, { createdAt: 'desc' }],
        take: 8,
        include: {
          sale: { select: { id: true, customer: { select: { fullNameEn: true } }, project: { select: { nameEn: true } } } },
        },
      }),
    ]);

  const statusCounts: Record<string, number> = { AVAILABLE: 0, RESERVED: 0, BOOKED: 0, SOLD: 0 };
  for (const g of plotsByStatus) statusCounts[g.status] = g._count;

  const totalPrice: Poisha = toPoisha(priceAgg._sum.salePrice?.toString() ?? '0');
  const totalPaid: Poisha = toPoisha(paidAgg._sum.amount?.toString() ?? '0');

  return {
    statusCounts,
    totalPlots: Object.values(statusCounts).reduce((a, b) => a + b, 0),
    soldThisMonth,
    collectionThisMonth: toPoisha(collectionAgg._sum.amount?.toString() ?? '0'),
    outstanding: totalPrice - totalPaid,
    overdueCount,
    recentPayments,
  };
}

// --------------------------------------------------- who-bought-what report
export interface SaleRow {
  saleCode: string;
  project: string;
  plot: string;
  sizeKatha: string;
  sector: string;
  customer: string;
  phone: string;
  salePrice: string;
  paid: string;
  outstanding: string;
  paymentType: string;
  status: string;
  bookingDate: string;
}

export async function salesReport(
  scope: ProjectScope,
  filters: { size?: string; sector?: string; type?: string; from?: string; to?: string; staff?: string },
): Promise<SaleRow[]> {
  const where: Prisma.SaleWhereInput = { status: { not: 'CANCELLED' } };
  if (scope) where.projectId = scope;
  if (filters.type) where.paymentType = filters.type as Prisma.SaleWhereInput['paymentType'];
  if (filters.staff) where.createdById = filters.staff;
  if (filters.from || filters.to) {
    where.bookingDate = {};
    if (filters.from) where.bookingDate.gte = new Date(filters.from);
    if (filters.to) where.bookingDate.lte = new Date(filters.to);
  }
  const plotFilter: Prisma.PlotWhereInput = {};
  if (filters.sector) plotFilter.sector = filters.sector;
  if (filters.size) plotFilter.sizeKatha = new Prisma.Decimal(filters.size);
  if (Object.keys(plotFilter).length) where.plot = plotFilter;

  const sales = await prisma.sale.findMany({
    where,
    orderBy: { bookingDate: 'desc' },
    include: {
      project: { select: { nameEn: true } },
      plot: { select: { sector: true, plotNumber: true, sizeKatha: true } },
      customer: { select: { fullNameEn: true, phonePrimary: true } },
      payments: { where: { isVoided: false }, select: { amount: true } },
    },
  });

  return sales.map((s) => {
    const price = toPoisha(s.salePrice.toString());
    const paid = sum(s.payments.map((p) => toPoisha(p.amount.toString())));
    return {
      saleCode: s.saleCode,
      project: s.project.nameEn,
      plot: s.plot.plotNumber,
      sizeKatha: s.plot.sizeKatha.toString(),
      sector: s.plot.sector,
      customer: s.customer.fullNameEn,
      phone: s.customer.phonePrimary,
      salePrice: (Number(price) / 100).toFixed(2),
      paid: (Number(paid) / 100).toFixed(2),
      outstanding: (Number(price - paid) / 100).toFixed(2),
      paymentType: s.paymentType,
      status: s.status,
      bookingDate: s.bookingDate.toLocaleDateString('en-GB'),
    };
  });
}

// --------------------------------------------------------- overdue report
export async function overdueReport(scope: ProjectScope) {
  return prisma.installment.findMany({
    where: { status: 'OVERDUE', ...(scope ? { sale: { projectId: scope } } : {}) },
    orderBy: { dueDate: 'asc' },
    take: 500,
    include: {
      sale: {
        select: {
          id: true,
          saleCode: true,
          project: { select: { nameEn: true } },
          customer: { select: { fullNameEn: true, phonePrimary: true } },
          plot: { select: { plotNumber: true } },
        },
      },
    },
  });
}

// ------------------------------------------------- collection by method
export async function collectionByMethod(scope: ProjectScope, from?: string, to?: string) {
  const where: Prisma.PaymentWhereInput = { isVoided: false };
  if (scope) where.sale = { projectId: scope };
  if (from || to) {
    where.paymentDate = {};
    if (from) where.paymentDate.gte = new Date(from);
    if (to) where.paymentDate.lte = new Date(to);
  }
  const grouped = await prisma.payment.groupBy({ by: ['method'], where, _sum: { amount: true }, _count: true });
  return grouped.map((g) => ({
    method: g.method,
    count: g._count,
    total: (Number(toPoisha(g._sum.amount?.toString() ?? '0')) / 100).toFixed(2),
  }));
}
