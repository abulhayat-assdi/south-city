import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { requireStaff } from '@/server/session';
import { prisma } from '@/lib/db';
import { updateProject, type ProjectActionState } from '@/server/actions/projects';
import { PageHeader } from '@/components/admin/page-header';
import { ProjectForm } from '@/components/admin/project-form';

export const metadata: Metadata = { title: 'প্রজেক্ট সম্পাদনা' };

function jsonStr(v: unknown): string {
  if (v === null || v === undefined) return '';
  return JSON.stringify(v, null, 2);
}

export default async function EditProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  await requireStaff();
  const { slug } = await params;
  const p = await prisma.project.findUnique({ where: { slug } });
  if (!p) notFound();

  const action = updateProject.bind(null, p.id) as (prev: ProjectActionState, fd: FormData) => Promise<ProjectActionState>;

  return (
    <div>
      <PageHeader title={`সম্পাদনা: ${p.nameBn ?? p.nameEn}`} />
      <ProjectForm
        action={action}
        submitLabel="পরিবর্তন সংরক্ষণ করুন"
        initial={{
          slug: p.slug,
          nameEn: p.nameEn,
          nameBn: p.nameBn ?? '',
          status: p.status,
          tagline: p.tagline ?? '',
          logoUrl: p.logoUrl ?? '',
          heroImageUrl: p.heroImageUrl ?? '',
          masterPlanUrl: p.masterPlanUrl ?? '',
          locationEn: p.locationEn ?? '',
          locationBn: p.locationBn ?? '',
          sizeText: p.sizeText ?? '',
          sectorsText: p.sectorsText ?? '',
          plotSizesText: p.plotSizesText ?? '',
          roadWidthText: p.roadWidthText ?? '',
          descriptionEn: p.descriptionEn ?? '',
          descriptionBn: p.descriptionBn ?? '',
          mapEmbedUrl: p.mapEmbedUrl ?? '',
          brochureUrl: p.brochureUrl ?? '',
          amenities: jsonStr(p.amenities),
          landmarks: jsonStr(p.landmarks),
          distances: jsonStr(p.distances),
          boundaries: jsonStr(p.boundaries),
          plotTypes: jsonStr(p.plotTypes),
          trustItems: jsonStr(p.trustItems),
          sortOrder: String(p.sortOrder),
          isPublished: p.isPublished,
        }}
      />
    </div>
  );
}
