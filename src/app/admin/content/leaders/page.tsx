import type { Metadata } from 'next';
import { requireAdmin } from '@/server/session';
import { prisma } from '@/lib/db';
import { PageHeader } from '@/components/admin/page-header';
import { LeaderForm } from '@/components/admin/leader-form';

export const metadata: Metadata = { title: 'চেয়ারম্যান / এমডি বার্তা' };

export default async function LeadersPage() {
  await requireAdmin();
  const leaders = await prisma.leaderMessage.findMany({ orderBy: { sortOrder: 'asc' } });

  return (
    <div>
      <PageHeader title="চেয়ারম্যান ও এমডি বার্তা" />
      <div className="space-y-6">
        {leaders.map((l) => (
          <LeaderForm
            key={l.id}
            initial={{
              id: l.id, role: l.role, personName: l.personName,
              titleEn: l.titleEn ?? '', titleBn: l.titleBn ?? '',
              photoUrl: l.photoUrl ?? '', messageEn: l.messageEn ?? '', messageBn: l.messageBn ?? '',
            }}
          />
        ))}
        {leaders.length === 0 && <p className="text-muted-foreground">কোনো বার্তা নেই — seed চালান।</p>}
      </div>
    </div>
  );
}
