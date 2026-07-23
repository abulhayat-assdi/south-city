'use server';

import { revalidatePath } from 'next/cache';
import { revalidatePublicContent } from '@/server/public-data';
import { redirect } from 'next/navigation';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/db';
import { assertPermission } from '@/server/session';
import { writeAudit } from '@/lib/audit';
import { projectSchema } from '@/lib/validators/project';

export interface ProjectActionState {
  error?: string;
}

function nn(v: string | undefined | null): string | null {
  return v && v !== '' ? v : null;
}

function json(v: string | undefined | null): Prisma.InputJsonValue | typeof Prisma.JsonNull {
  if (!v || v === '') return Prisma.JsonNull;
  return JSON.parse(v) as Prisma.InputJsonValue;
}

function parse(formData: FormData) {
  return projectSchema.safeParse(Object.fromEntries(formData.entries()));
}

function toData(d: import('@/lib/validators/project').ProjectInput) {
  return {
    nameEn: d.nameEn,
    nameBn: nn(d.nameBn),
    status: d.status,
    tagline: nn(d.tagline),
    logoUrl: nn(d.logoUrl),
    heroImageUrl: nn(d.heroImageUrl),
    masterPlanUrl: nn(d.masterPlanUrl),
    locationEn: nn(d.locationEn),
    locationBn: nn(d.locationBn),
    sizeText: nn(d.sizeText),
    sectorsText: nn(d.sectorsText),
    plotSizesText: nn(d.plotSizesText),
    roadWidthText: nn(d.roadWidthText),
    descriptionEn: nn(d.descriptionEn),
    descriptionBn: nn(d.descriptionBn),
    mapEmbedUrl: nn(d.mapEmbedUrl),
    brochureUrl: nn(d.brochureUrl),
    amenities: json(d.amenities),
    landmarks: json(d.landmarks),
    distances: json(d.distances),
    boundaries: json(d.boundaries),
    plotTypes: json(d.plotTypes),
    trustItems: json(d.trustItems),
    sortOrder: d.sortOrder,
    isPublished: d.isPublished === 'on',
  };
}

export async function createProject(_prev: ProjectActionState, formData: FormData): Promise<ProjectActionState> {
  const user = await assertPermission('project:write');
  const parsed = parse(formData);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };
  const d = parsed.data;

  let newSlug = '';
  try {
    await prisma.$transaction(async (tx) => {
      const project = await tx.project.create({ data: { slug: d.slug, ...toData(d) } });
      newSlug = project.slug;
      await writeAudit(tx, { userId: user.id, action: 'CREATE_PROJECT', entity: 'Project', entityId: project.id, after: project });
    });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
      return { error: 'এই slug ইতিমধ্যে ব্যবহৃত হয়েছে' };
    }
    throw e;
  }

  revalidatePublicContent();
  revalidatePath('/admin/projects');
  revalidatePath('/projects');
  redirect(`/admin/projects/${newSlug}`);
}

export async function updateProject(id: string, _prev: ProjectActionState, formData: FormData): Promise<ProjectActionState> {
  const user = await assertPermission('project:write');
  const parsed = parse(formData);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };
  const d = parsed.data;

  const before = await prisma.project.findUnique({ where: { id } });
  if (!before) return { error: 'প্রজেক্ট পাওয়া যায়নি' };

  try {
    await prisma.$transaction(async (tx) => {
      const project = await tx.project.update({ where: { id }, data: { slug: d.slug, ...toData(d) } });
      await writeAudit(tx, { userId: user.id, action: 'UPDATE_PROJECT', entity: 'Project', entityId: id, before, after: project });
    });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
      return { error: 'এই slug ইতিমধ্যে ব্যবহৃত হয়েছে' };
    }
    throw e;
  }

  revalidatePublicContent();
  revalidatePath('/admin/projects');
  revalidatePath(`/projects/${d.slug}`);
  revalidatePath('/projects');
  redirect(`/admin/projects/${d.slug}`);
}

// ---------------------------------------------------------------- gallery
export async function addProjectImage(
  projectId: string,
  _prev: { error?: string; ok?: boolean },
  formData: FormData,
): Promise<{ error?: string; ok?: boolean }> {
  await assertPermission('project:write');
  const url = String(formData.get('url') ?? '').trim();
  if (!url) return { error: 'ছবির URL দিন' };
  const captionEn = String(formData.get('captionEn') ?? '').trim() || null;
  const captionBn = String(formData.get('captionBn') ?? '').trim() || null;
  const count = await prisma.projectImage.count({ where: { projectId } });
  await prisma.projectImage.create({ data: { projectId, url, captionEn, captionBn, sortOrder: count } });
  revalidatePublicContent();
  revalidatePath(`/admin/projects`);
  return { ok: true };
}

export async function deleteProjectImage(id: string): Promise<{ error?: string }> {
  await assertPermission('project:write');
  await prisma.projectImage.delete({ where: { id } });
  revalidatePublicContent();
  revalidatePath('/admin/projects');
  return {};
}
