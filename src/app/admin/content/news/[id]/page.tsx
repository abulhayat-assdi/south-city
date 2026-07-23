import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { requireAdmin } from '@/server/session';
import { prisma } from '@/lib/db';
import { deleteNews } from '@/server/actions/content';
import { PageHeader } from '@/components/admin/page-header';
import { NewsForm } from '@/components/admin/news-form';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = { title: 'নিউজ সম্পাদনা' };

export default async function EditNewsPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const p = await prisma.newsPost.findUnique({ where: { id } });
  if (!p) notFound();

  async function remove() {
    'use server';
    await deleteNews(id);
    const { redirect } = await import('next/navigation');
    redirect('/admin/content/news');
  }

  return (
    <div>
      <PageHeader
        title="নিউজ সম্পাদনা"
        action={<form action={remove}><Button variant="destructive" size="sm" type="submit">মুছুন</Button></form>}
      />
      <NewsForm
        initial={{
          id: p.id, slug: p.slug, titleEn: p.titleEn, titleBn: p.titleBn ?? '',
          bodyEn: p.bodyEn ?? '', bodyBn: p.bodyBn ?? '', coverUrl: p.coverUrl ?? '', isPublished: p.isPublished,
        }}
      />
    </div>
  );
}
