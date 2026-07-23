import type { Metadata } from 'next';
import { requireStaff } from '@/server/session';
import { prisma } from '@/lib/db';
import { createSale } from '@/server/actions/sales';
import { PageHeader } from '@/components/admin/page-header';
import { SaleForm } from '@/components/admin/sale-form';
import { formatKatha } from '@/lib/katha';
import { listProjectsForSwitcher, getActiveProjectId } from '@/server/projects';

export const metadata: Metadata = { title: 'নতুন বিক্রয়' };

interface SearchParams { customerId?: string }

export default async function NewSalePage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  await requireStaff();
  const sp = await searchParams;
  const [projects, activeProject, availablePlots, customers] = await Promise.all([
    listProjectsForSwitcher(),
    getActiveProjectId(),
    prisma.plot.findMany({
      where: { status: 'AVAILABLE' },
      orderBy: [{ sector: 'asc' }, { plotNumber: 'asc' }],
      select: { id: true, projectId: true, sector: true, plotNumber: true, sizeKatha: true, basePrice: true },
    }),
    prisma.customer.findMany({
      orderBy: { createdAt: 'desc' },
      take: 500,
      select: { id: true, customerCode: true, fullNameEn: true, phonePrimary: true },
    }),
  ]);

  return (
    <div>
      <PageHeader title="নতুন বিক্রয়" subtitle="প্রজেক্ট → খালি প্লট → কাস্টমার → মূল্য ও শর্ত" />
      <SaleForm
        action={createSale}
        projects={projects.map((p) => ({ id: p.id, name: p.nameBn ?? p.nameEn }))}
        plots={availablePlots.map((p) => ({
          id: p.id,
          projectId: p.projectId,
          label: `${p.plotNumber} · ${formatKatha(p.sizeKatha.toString(), 'bn')}`,
          basePrice: p.basePrice?.toString() ?? null,
        }))}
        customers={customers.map((c) => ({ id: c.id, label: `${c.customerCode} · ${c.fullNameEn} · ${c.phonePrimary}` }))}
        defaultProjectId={activeProject ?? undefined}
        defaultCustomerId={sp.customerId}
      />
    </div>
  );
}
