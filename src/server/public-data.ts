import 'server-only';
import { unstable_cache, updateTag } from 'next/cache';
import { prisma } from '@/lib/db';

/**
 * Public-site data access (spec §2, §6).
 *
 * Public pages are rendered on demand but their data is CACHED for 5 minutes,
 * so a burst of visitors costs at most one query per window — the practical
 * equivalent of ISR for BD mobile. We cache the data rather than prerendering
 * the pages because the production image is built with `docker build`, where
 * the Postgres service is not reachable; prerendering would fail the build.
 *
 * Saving content in /admin/content calls revalidatePublicContent() to flush
 * these caches immediately.
 */
const TAG = 'public-content';
const REVALIDATE = 300;

/**
 * Flush all cached public-site content so an admin edit shows up immediately.
 * Uses updateTag (read-your-own-writes) — only valid inside a Server Action,
 * which is the only place this is called from.
 */
export function revalidatePublicContent() {
  updateTag(TAG);
}

const FALLBACK_COMPANY = {
  id: 1,
  nameEn: 'South Dhaka Properties & Housing Ltd.',
  nameBn: 'সাউথ ঢাকা প্রপার্টিজ অ্যান্ড হাউজিং লিমিটেড',
  taglinePrimary: 'Where Your Dream Finds Its Address',
  taglineSecondary: 'Building Landmark, Creating Legacy',
  aboutEn: null, aboutBn: null, visionEn: null, visionBn: null, missionEn: null, missionBn: null,
  coreValues: null, logoUrl: null, phone: null, email: null,
  addressEn: null, addressBn: null, facebook: null, youtube: null, linkedin: null, whatsapp: null,
  updatedAt: new Date(0),
};

/** The company profile for public pages — safe fields only (no ERP data). */
export const getCompany = unstable_cache(
  async () => (await prisma.companyProfile.findUnique({ where: { id: 1 } })) ?? FALLBACK_COMPANY,
  ['company-profile'],
  { revalidate: REVALIDATE, tags: [TAG] },
);

export const getPublishedProjects = unstable_cache(
  async () =>
    prisma.project.findMany({
      where: { isPublished: true },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
    }),
  ['published-projects'],
  { revalidate: REVALIDATE, tags: [TAG] },
);

export const getProjectBySlug = unstable_cache(
  async (slug: string) =>
    prisma.project.findFirst({
      where: { slug, isPublished: true },
      include: { gallery: { orderBy: { sortOrder: 'asc' } } },
    }),
  ['project-by-slug'],
  { revalidate: REVALIDATE, tags: [TAG] },
);

export const getPublishedNews = unstable_cache(
  async (take = 6) =>
    prisma.newsPost.findMany({
      where: { isPublished: true },
      orderBy: [{ publishedAt: 'desc' }, { createdAt: 'desc' }],
      take,
    }),
  ['published-news'],
  { revalidate: REVALIDATE, tags: [TAG] },
);

export const getNewsBySlug = unstable_cache(
  async (slug: string) => prisma.newsPost.findFirst({ where: { slug, isPublished: true } }),
  ['news-by-slug'],
  { revalidate: REVALIDATE, tags: [TAG] },
);

export const getLeaderByRole = unstable_cache(
  async (role: 'CHAIRMAN' | 'MD') => prisma.leaderMessage.findFirst({ where: { role } }),
  ['leader-by-role'],
  { revalidate: REVALIDATE, tags: [TAG] },
);
