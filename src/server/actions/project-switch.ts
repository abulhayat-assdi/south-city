'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { ACTIVE_PROJECT_COOKIE } from '@/server/projects';

/** Set the admin's active project scope (id, or "all"). Called by the switcher. */
export async function setActiveProject(value: string): Promise<void> {
  const jar = await cookies();
  jar.set(ACTIVE_PROJECT_COOKIE, value || 'all', {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
  });
  revalidatePath('/admin', 'layout');
}
