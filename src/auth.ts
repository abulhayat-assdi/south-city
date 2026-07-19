import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { z } from 'zod';
import { authConfig } from '@/server/auth.config';
import { prisma } from '@/lib/db';
import { verifyPassword } from '@/lib/password';

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

// Simple in-process login throttle (spec §5/§13). Persistent lock also lives on
// the User row (lockedUntil) for defence across restarts.
const MAX_FAILED = 5;
const LOCK_MINUTES = 15;

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: { email: {}, password: {} },
      async authorize(raw) {
        const parsed = credentialsSchema.safeParse(raw);
        if (!parsed.success) return null;
        const { email, password } = parsed.data;

        const user = await prisma.user.findUnique({
          where: { email: email.toLowerCase() },
          include: { customer: { select: { id: true } } },
        });
        if (!user || !user.isActive) return null;

        if (user.lockedUntil && user.lockedUntil > new Date()) {
          return null; // temporarily locked
        }

        const ok = await verifyPassword(password, user.passwordHash);
        if (!ok) {
          const failed = user.failedLoginCount + 1;
          await prisma.user.update({
            where: { id: user.id },
            data: {
              failedLoginCount: failed,
              lockedUntil:
                failed >= MAX_FAILED ? new Date(Date.now() + LOCK_MINUTES * 60_000) : null,
            },
          });
          return null;
        }

        await prisma.user.update({
          where: { id: user.id },
          data: { failedLoginCount: 0, lockedUntil: null, lastLoginAt: new Date() },
        });

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          customerId: user.customer?.id ?? null,
          mustChangePassword: user.mustChangePassword,
        };
      },
    }),
  ],
});
