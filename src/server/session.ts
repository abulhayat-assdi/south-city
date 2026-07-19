import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { can, isStaff, type Permission } from '@/lib/rbac';
import type { Role } from '@prisma/client';

export interface SessionUser {
  id: string;
  name?: string | null;
  email?: string | null;
  role: Role;
  customerId: string | null;
  mustChangePassword: boolean;
}

/** Get the current user or null. */
export async function currentUser(): Promise<SessionUser | null> {
  const session = await auth();
  return (session?.user as SessionUser) ?? null;
}

/** Require any authenticated user, else redirect to login. */
export async function requireUser(): Promise<SessionUser> {
  const user = await currentUser();
  if (!user) redirect('/login');
  if (user.mustChangePassword) redirect('/change-password');
  return user;
}

/** Require ADMIN or STAFF (admin panel). */
export async function requireStaff(): Promise<SessionUser> {
  const user = await requireUser();
  if (!isStaff(user.role)) redirect('/login');
  return user;
}

/** Require ADMIN. */
export async function requireAdmin(): Promise<SessionUser> {
  const user = await requireUser();
  if (user.role !== 'ADMIN') redirect('/admin');
  return user;
}

/** Require the CUSTOMER role (portal). */
export async function requireCustomer(): Promise<SessionUser> {
  const user = await requireUser();
  if (user.role !== 'CUSTOMER' || !user.customerId) redirect('/login');
  return user;
}

/**
 * Assert a permission inside a server action. Throws (not redirects) so the
 * action fails loudly — the UI should already hide disallowed actions, but the
 * server must never rely on that (spec §5/§13).
 */
export async function assertPermission(permission: Permission): Promise<SessionUser> {
  const user = await currentUser();
  if (!user) throw new Error('Unauthorized');
  if (!can(user.role, permission)) throw new Error('Forbidden');
  return user;
}
