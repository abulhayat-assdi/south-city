import 'server-only';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/db';

const COOKIE = 'activeProject';

export interface ProjectOption {
  id: string;
  nameEn: string;
  nameBn: string | null;
  slug: string;
}

/** All projects for the admin switcher (published or not). */
export async function listProjectsForSwitcher(): Promise<ProjectOption[]> {
  return prisma.project.findMany({
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
    select: { id: true, nameEn: true, nameBn: true, slug: true },
  });
}

/**
 * The admin's currently-selected project scope. Returns null = "All projects".
 * A `?project=` URL param (when passed) always wins over the stored cookie.
 */
export async function getActiveProjectId(urlParam?: string): Promise<string | null> {
  if (urlParam !== undefined) return urlParam === 'all' || urlParam === '' ? null : urlParam;
  const jar = await cookies();
  const val = jar.get(COOKIE)?.value;
  if (!val || val === 'all') return null;
  // Verify it still exists (a project could have been deleted).
  const exists = await prisma.project.findUnique({ where: { id: val }, select: { id: true } });
  return exists ? val : null;
}

export const ACTIVE_PROJECT_COOKIE = COOKIE;
