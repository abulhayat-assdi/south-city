'use server';

import { revalidatePath } from 'next/cache';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/db';
import { assertPermission } from '@/server/session';
import { writeAudit } from '@/lib/audit';
import { hashPassword, generateTempPassword } from '@/lib/password';
import { z } from 'zod';

export interface UserActionState {
  error?: string;
  ok?: boolean;
  tempPassword?: string;
  email?: string;
}

const createSchema = z.object({
  name: z.string().trim().min(1, 'নাম দিন').max(120),
  email: z.string().trim().email('ইমেইল সঠিক নয়'),
  phone: z.string().trim().optional().or(z.literal('')),
  role: z.enum(['ADMIN', 'STAFF']),
});

/** Create a staff/admin login (spec §5/§8). Customers get logins from the customer page. */
export async function createStaffUser(_prev: UserActionState, fd: FormData): Promise<UserActionState> {
  const actor = await assertPermission('user:manage');
  const parsed = createSchema.safeParse(Object.fromEntries(fd.entries()));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };
  const d = parsed.data;

  const tempPassword = generateTempPassword();
  try {
    await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name: d.name,
          email: d.email.toLowerCase(),
          phone: d.phone || null,
          passwordHash: await hashPassword(tempPassword),
          role: d.role,
          mustChangePassword: true,
        },
      });
      await writeAudit(tx, { userId: actor.id, action: 'CREATE_USER', entity: 'User', entityId: user.id, after: { email: user.email, role: user.role } });
    });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') return { error: 'এই ইমেইলে অ্যাকাউন্ট আছে' };
    throw e;
  }

  revalidatePath('/admin/users');
  return { ok: true, tempPassword, email: d.email.toLowerCase() };
}

export async function toggleUserActive(id: string): Promise<{ error?: string }> {
  const actor = await assertPermission('user:manage');
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) return { error: 'ইউজার পাওয়া যায়নি' };
  if (user.id === actor.id) return { error: 'নিজের অ্যাকাউন্ট নিষ্ক্রিয় করা যাবে না' };

  await prisma.$transaction(async (tx) => {
    await tx.user.update({ where: { id }, data: { isActive: !user.isActive } });
    await writeAudit(tx, { userId: actor.id, action: user.isActive ? 'DEACTIVATE_USER' : 'ACTIVATE_USER', entity: 'User', entityId: id });
  });
  revalidatePath('/admin/users');
  return {};
}

export async function resetUserPassword(id: string): Promise<{ error?: string; tempPassword?: string }> {
  const actor = await assertPermission('user:manage');
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) return { error: 'ইউজার পাওয়া যায়নি' };

  const tempPassword = generateTempPassword();
  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id },
      data: { passwordHash: await hashPassword(tempPassword), mustChangePassword: true, failedLoginCount: 0, lockedUntil: null },
    });
    await writeAudit(tx, { userId: actor.id, action: 'RESET_PASSWORD', entity: 'User', entityId: id });
  });
  revalidatePath('/admin/users');
  return { tempPassword };
}
