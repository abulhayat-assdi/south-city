'use server';

import { AuthError } from 'next-auth';
import { z } from 'zod';
import { signIn } from '@/auth';
import { prisma } from '@/lib/db';
import { currentUser } from '@/server/session';
import { hashPassword, verifyPassword } from '@/lib/password';

export interface ActionState {
  error?: string;
  ok?: boolean;
}

export async function loginAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const email = String(formData.get('email') ?? '').toLowerCase();
  const password = String(formData.get('password') ?? '');
  try {
    await signIn('credentials', { email, password, redirectTo: '/post-login' });
    return {};
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: 'ইমেইল বা পাসওয়ার্ড সঠিক নয় / Invalid email or password' };
    }
    throw error; // re-throw the redirect
  }
}

const passwordSchema = z
  .object({
    newPassword: z.string().min(8, 'পাসওয়ার্ড কমপক্ষে ৮ অক্ষরের হতে হবে'),
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: 'পাসওয়ার্ড মিলছে না / Passwords do not match',
    path: ['confirmPassword'],
  });

export async function changePasswordAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await currentUser();
  if (!user) return { error: 'Unauthorized' };

  const parsed = passwordSchema.safeParse({
    newPassword: String(formData.get('newPassword') ?? ''),
    confirmPassword: String(formData.get('confirmPassword') ?? ''),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Invalid input' };
  }

  const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
  if (!dbUser) return { error: 'Unauthorized' };

  // Prevent reusing the exact same password.
  if (await verifyPassword(parsed.data.newPassword, dbUser.passwordHash)) {
    return { error: 'নতুন পাসওয়ার্ড আগেরটির থেকে ভিন্ন হতে হবে' };
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordHash: await hashPassword(parsed.data.newPassword),
      mustChangePassword: false,
    },
  });

  // Re-sign in to refresh the JWT (clears mustChangePassword) and route by role.
  try {
    await signIn('credentials', {
      email: dbUser.email,
      password: parsed.data.newPassword,
      redirectTo: '/post-login',
    });
    return { ok: true };
  } catch (error) {
    if (error instanceof AuthError) return { error: 'Re-login failed' };
    throw error;
  }
}
