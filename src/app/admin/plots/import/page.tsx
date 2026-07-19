import type { Metadata } from 'next';
import { requireStaff } from '@/server/session';
import { PageHeader } from '@/components/admin/page-header';
import { ImportForm } from './import-form';

export const metadata: Metadata = { title: 'প্লট CSV ইমপোর্ট' };

export default async function ImportPlotsPage() {
  await requireStaff();
  return (
    <div>
      <PageHeader title="প্লট CSV ইমপোর্ট" subtitle="একসাথে অনেক প্লট যোগ করুন" />
      <ImportForm />
    </div>
  );
}
