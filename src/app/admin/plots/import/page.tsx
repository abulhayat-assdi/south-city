import type { Metadata } from 'next';
import { requireStaff } from '@/server/session';
import { PageHeader } from '@/components/admin/page-header';
import { ImportForm } from './import-form';
import { listProjectsForSwitcher, getActiveProjectId } from '@/server/projects';

export const metadata: Metadata = { title: 'প্লট CSV ইমপোর্ট' };

export default async function ImportPlotsPage() {
  await requireStaff();
  const [projects, activeProject] = await Promise.all([listProjectsForSwitcher(), getActiveProjectId()]);
  const choices = projects.map((p) => ({ id: p.id, name: p.nameBn ?? p.nameEn }));

  return (
    <div>
      <PageHeader title="প্লট CSV ইমপোর্ট" subtitle="একসাথে অনেক প্লট যোগ করুন" />
      <ImportForm projects={choices} defaultProjectId={activeProject ?? undefined} />
    </div>
  );
}
