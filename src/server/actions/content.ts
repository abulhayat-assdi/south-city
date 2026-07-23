'use server';

import { revalidatePath } from 'next/cache';
import { revalidatePublicContent } from '@/server/public-data';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/db';
import { assertPermission } from '@/server/session';
import { writeAudit } from '@/lib/audit';

export interface ContentActionState {
  error?: string;
  ok?: boolean;
}

const s = (fd: FormData, k: string) => {
  const v = fd.get(k);
  return v && String(v).trim() !== '' ? String(v).trim() : null;
};

// ------------------------------------------------------- company profile
export async function updateCompanyProfile(_prev: ContentActionState, fd: FormData): Promise<ContentActionState> {
  const user = await assertPermission('content:write');

  let coreValues: Prisma.InputJsonValue | typeof Prisma.JsonNull = Prisma.JsonNull;
  const raw = s(fd, 'coreValues');
  if (raw) {
    try {
      coreValues = JSON.parse(raw) as Prisma.InputJsonValue;
    } catch {
      return { error: 'Core values JSON সঠিক নয়' };
    }
  }

  const data = {
    nameEn: s(fd, 'nameEn') ?? 'South Dhaka Properties & Housing Ltd.',
    nameBn: s(fd, 'nameBn'),
    taglinePrimary: s(fd, 'taglinePrimary'),
    taglineSecondary: s(fd, 'taglineSecondary'),
    aboutEn: s(fd, 'aboutEn'), aboutBn: s(fd, 'aboutBn'),
    visionEn: s(fd, 'visionEn'), visionBn: s(fd, 'visionBn'),
    missionEn: s(fd, 'missionEn'), missionBn: s(fd, 'missionBn'),
    coreValues,
    logoUrl: s(fd, 'logoUrl'),
    phone: s(fd, 'phone'), email: s(fd, 'email'),
    addressEn: s(fd, 'addressEn'), addressBn: s(fd, 'addressBn'),
    facebook: s(fd, 'facebook'), youtube: s(fd, 'youtube'),
    linkedin: s(fd, 'linkedin'), whatsapp: s(fd, 'whatsapp'),
  };

  await prisma.$transaction(async (tx) => {
    await tx.companyProfile.upsert({ where: { id: 1 }, update: data, create: { id: 1, ...data } });
    await writeAudit(tx, { userId: user.id, action: 'UPDATE_COMPANY', entity: 'CompanyProfile', entityId: '1' });
  });

  revalidatePublicContent();
  revalidatePath('/');
  revalidatePath('/about');
  return { ok: true };
}

// ------------------------------------------------------- leader messages
export async function updateLeaderMessage(id: string, _prev: ContentActionState, fd: FormData): Promise<ContentActionState> {
  const user = await assertPermission('content:write');
  const data = {
    personName: s(fd, 'personName') ?? '',
    titleEn: s(fd, 'titleEn'), titleBn: s(fd, 'titleBn'),
    photoUrl: s(fd, 'photoUrl'),
    messageEn: s(fd, 'messageEn'), messageBn: s(fd, 'messageBn'),
  };
  await prisma.$transaction(async (tx) => {
    await tx.leaderMessage.update({ where: { id }, data });
    await writeAudit(tx, { userId: user.id, action: 'UPDATE_LEADER', entity: 'LeaderMessage', entityId: id });
  });
  revalidatePublicContent();
  revalidatePath('/message/chairman');
  revalidatePath('/message/md');
  return { ok: true };
}

// --------------------------------------------------------------- news
export async function upsertNews(_prev: ContentActionState, fd: FormData): Promise<ContentActionState> {
  const user = await assertPermission('content:write');
  const id = s(fd, 'id');
  const slug = s(fd, 'slug');
  const titleEn = s(fd, 'titleEn');
  if (!slug || !titleEn) return { error: 'slug ও শিরোনাম (English) দিন' };
  const isPublished = fd.get('isPublished') === 'on';

  const data = {
    slug,
    titleEn,
    titleBn: s(fd, 'titleBn'),
    bodyEn: s(fd, 'bodyEn'),
    bodyBn: s(fd, 'bodyBn'),
    coverUrl: s(fd, 'coverUrl'),
    isPublished,
    publishedAt: isPublished ? new Date() : null,
  };

  try {
    await prisma.$transaction(async (tx) => {
      const post = id
        ? await tx.newsPost.update({ where: { id }, data })
        : await tx.newsPost.create({ data });
      await writeAudit(tx, { userId: user.id, action: id ? 'UPDATE_NEWS' : 'CREATE_NEWS', entity: 'NewsPost', entityId: post.id });
    });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') return { error: 'এই slug ইতিমধ্যে আছে' };
    throw e;
  }

  revalidatePublicContent();
  revalidatePath('/news');
  revalidatePath('/admin/content/news');
  return { ok: true };
}

export async function deleteNews(id: string): Promise<{ error?: string }> {
  const user = await assertPermission('content:write');
  await prisma.$transaction(async (tx) => {
    await tx.newsPost.delete({ where: { id } });
    await writeAudit(tx, { userId: user.id, action: 'DELETE_NEWS', entity: 'NewsPost', entityId: id });
  });
  revalidatePublicContent();
  revalidatePath('/news');
  revalidatePath('/admin/content/news');
  return {};
}
