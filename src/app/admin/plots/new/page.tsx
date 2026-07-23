import type { Metadata } from 'next';
import { requireStaff } from '@/server/session';
import { createPlot } from '@/server/actions/plots';
import { PageHeader } from '@/components/admin/page-header';
import { PlotForm } from '@/components/admin/plot-form';
import { listProjectsForSwitcher, getActiveProjectId } from '@/server/projects';

export const metadata: Metadata = { title: 'নতুন প্লট' };

export default async function NewPlotPage() {
  await requireStaff();
  const [projects, activeProject] = await Promise.all([listProjectsForSwitcher(), getActiveProjectId()]);
  const choices = projects.map((p) => ({ id: p.id, name: p.nameBn ?? p.nameEn }));

  return (
    <div>
      <PageHeader title="নতুন প্লট যোগ করুন" />
      <PlotForm
        action={createPlot}
        submitLabel="প্লট সংরক্ষণ করুন"
        projects={choices}
        initial={{ projectId: activeProject ?? choices[0]?.id }}
      />
    </div>
  );
}
