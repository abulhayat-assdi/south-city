import type { Metadata } from 'next';
import { requireAdmin } from '@/server/session';
import { prisma } from '@/lib/db';
import { PageHeader } from '@/components/admin/page-header';
import { UserManager } from '@/components/admin/user-manager';

export const metadata: Metadata = { title: 'ইউজার' };

export default async function UsersPage() {
  await requireAdmin();
  const users = await prisma.user.findMany({
    orderBy: [{ role: 'asc' }, { createdAt: 'desc' }],
    include: { customer: { select: { customerCode: true } } },
    take: 500,
  });

  return (
    <div>
      <PageHeader title="ইউজার ব্যবস্থাপনা" subtitle="স্টাফ/অ্যাডমিন তৈরি, নিষ্ক্রিয় ও পাসওয়ার্ড রিসেট।" />
      <UserManager
        users={users.map((u) => ({
          id: u.id, name: u.name, email: u.email, role: u.role, isActive: u.isActive,
          customerCode: u.customer?.customerCode ?? null,
        }))}
      />
    </div>
  );
}
