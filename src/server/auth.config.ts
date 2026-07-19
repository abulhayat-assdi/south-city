import type { NextAuthConfig } from 'next-auth';
import type { Role } from '@prisma/client';

/**
 * Edge-safe auth config: pages, session strategy, and callbacks only — NO
 * database or bcrypt imports, so it can run in the middleware (Edge runtime).
 * The Credentials provider (which needs Prisma + bcrypt) is added in src/auth.ts.
 */
export const authConfig = {
  pages: { signIn: '/login' },
  session: { strategy: 'jwt', maxAge: 60 * 60 * 8 }, // 8h
  trustHost: true,
  callbacks: {
    // Route protection — runs in middleware for every matched request (spec §5/§13).
    authorized({ auth, request }) {
      const { pathname } = request.nextUrl;
      const role = auth?.user?.role;

      const isAdmin = pathname.startsWith('/admin');
      const isPortal = pathname.startsWith('/portal');
      if (!isAdmin && !isPortal) return true; // public

      if (!auth?.user) return false; // -> redirect to /login

      if (isAdmin) return role === 'ADMIN' || role === 'STAFF';
      if (isPortal) return role === 'CUSTOMER';
      return true;
    },
    jwt({ token, user, trigger, session }) {
      if (user) {
        const u = user as { id: string; role: Role; customerId: string | null; mustChangePassword: boolean };
        token.id = u.id;
        token.role = u.role;
        token.customerId = u.customerId;
        token.mustChangePassword = u.mustChangePassword;
      }
      // Password-change flow updates the flag without a full re-login.
      if (trigger === 'update' && session?.mustChangePassword === false) {
        token.mustChangePassword = false;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as Role;
        session.user.customerId = (token.customerId as string | null) ?? null;
        session.user.mustChangePassword = Boolean(token.mustChangePassword);
      }
      return session;
    },
  },
  providers: [], // real providers added in src/auth.ts
} satisfies NextAuthConfig;
