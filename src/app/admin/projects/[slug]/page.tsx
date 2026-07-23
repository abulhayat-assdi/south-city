import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { requireStaff } from '@/server/session';
import { prisma } from '@/lib/db';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PageHeader } from '@/components/admin/page-header';
import { GalleryManager } from '@/components/admin/gallery-manager';
import { Pencil, ExternalLink } from 'lucide-react';

export const metadata: Metadata = { title: 'প্রজেক্ট বিবরণ' };

export default async function ProjectDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  await requireStaff();
  const { slug } = await params;
  const project = await prisma.project.findUnique({
    where: { slug },
    include: {
      gallery: { orderBy: { sortOrder: 'asc' } },
      _count: { select: { plots: true, sales: true } },
    },
  });
  if (!project) notFound();

  const facts: [string, string | null][] = [
    ['লোকেশন', project.locationBn ?? project.locationEn],
    ['আয়তন', project.sizeText],
    ['সেক্টর', project.sectorsText],
    ['প্লট সাইজ', project.plotSizesText],
    ['রাস্তা', project.roadWidthText],
    ['প্লট সংখ্যা', String(project._count.plots)],
    ['বিক্রয় সংখ্যা', String(project._count.sales)],
  ];

  return (
    <div>
      <PageHeader
        title={project.nameBn ?? project.nameEn}
        subtitle={`/${project.slug} · ${project.isPublished ? 'প্রকাশিত' : 'খসড়া'}`}
        action={
          <div className="flex gap-2">
            <Button asChild variant="outline">
              <Link href={`/projects/${project.slug}`} target="_blank"><ExternalLink className="size-4" /> পাবলিক পেজ</Link>
            </Button>
            <Button asChild>
              <Link href={`/admin/projects/${project.slug}/edit`}><Pencil className="size-4" /> সম্পাদনা</Link>
            </Button>
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader><CardTitle>তথ্য</CardTitle></CardHeader>
          <CardContent>
            <dl className="divide-y divide-line text-sm">
              {facts.map(([k, v]) => (
                <div key={k} className="flex justify-between gap-3 py-2">
                  <dt className="text-muted-foreground">{k}</dt>
                  <dd className="text-right font-medium text-ink">{v ?? '—'}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-4 flex gap-2">
              <Button asChild variant="outline" size="sm">
                <Link href={`/admin/plots?project=${project.id}`}>প্লট দেখুন</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>গ্যালারি</CardTitle></CardHeader>
          <CardContent>
            <GalleryManager projectId={project.id} images={project.gallery} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
