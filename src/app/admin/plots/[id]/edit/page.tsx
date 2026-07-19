import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { requireStaff } from '@/server/session';
import { prisma } from '@/lib/db';
import { updatePlot, type PlotActionState } from '@/server/actions/plots';
import { PageHeader } from '@/components/admin/page-header';
import { PlotForm } from '@/components/admin/plot-form';

export const metadata: Metadata = { title: 'প্লট এডিট' };

export default async function EditPlotPage({ params }: { params: Promise<{ id: string }> }) {
  await requireStaff();
  const { id } = await params;
  const plot = await prisma.plot.findUnique({ where: { id } });
  if (!plot) notFound();

  const action = updatePlot.bind(null, id) as (prev: PlotActionState, fd: FormData) => Promise<PlotActionState>;

  return (
    <div>
      <PageHeader title={`প্লট এডিট — ${plot.plotNumber}`} />
      <PlotForm
        action={action}
        submitLabel="পরিবর্তন সংরক্ষণ করুন"
        initial={{
          sector: plot.sector,
          plotNumber: plot.plotNumber,
          sizeKatha: plot.sizeKatha.toString(),
          category: plot.category,
          roadWidthFt: plot.roadWidthFt?.toString() ?? '',
          dimensions: plot.dimensions ?? '',
          faceDirection: plot.faceDirection ?? '',
          status: plot.status,
          basePrice: plot.basePrice?.toString() ?? '',
          remarks: plot.remarks ?? '',
        }}
      />
    </div>
  );
}
