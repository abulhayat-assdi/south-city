import type { Metadata } from 'next';
import { requireAdmin } from '@/server/session';
import { PageHeader } from '@/components/admin/page-header';
import { NewsForm } from '@/components/admin/news-form';

export const metadata: Metadata = { title: 'নতুন নিউজ' };

export default async function NewNewsPage() {
  await requireAdmin();
  return (
    <div>
      <PageHeader title="নতুন নিউজ পোস্ট" />
      <NewsForm />
    </div>
  );
}
