import type { Metadata } from 'next';
import { requireStaff } from '@/server/session';
import { createPlot } from '@/server/actions/plots';
import { PageHeader } from '@/components/admin/page-header';
import { PlotForm } from '@/components/admin/plot-form';

export const metadata: Metadata = { title: 'নতুন প্লট' };

export default async function NewPlotPage() {
  await requireStaff();
  return (
    <div>
      <PageHeader title="নতুন প্লট যোগ করুন" />
      <PlotForm action={createPlot} submitLabel="প্লট সংরক্ষণ করুন" />
    </div>
  );
}
