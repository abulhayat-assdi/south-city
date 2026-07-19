import NextAuth from 'next-auth';
import { authConfig } from '@/server/auth.config';

// Edge-safe middleware: uses authConfig only (no Prisma/bcrypt). The `authorized`
// callback in authConfig handles /admin and /portal protection.
export const { auth: middleware } = NextAuth(authConfig);

export default middleware;

export const config = {
  // Protect app areas; skip static assets, images and the auth API.
  matcher: ['/admin/:path*', '/portal/:path*'],
};
