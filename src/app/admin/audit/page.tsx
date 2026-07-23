import type { Metadata } from 'next';
import { requireAdmin } from '@/server/session';
import { prisma } from '@/lib/db';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PageHeader } from '@/components/admin/page-header';
import { Badge } from '@/components/ui/badge';

export const metadata: Metadata = { title: 'অডিট লগ' };

const dt = (d: Date) => d.toLocaleString('en-GB');

export default async function AuditPage({ searchParams }: { searchParams: Promise<{ entity?: string }> }) {
  await requireAdmin();
  const sp = await searchParams;
  const logs = await prisma.auditLog.findMany({
    where: sp.entity ? { entity: sp.entity } : {},
    orderBy: { createdAt: 'desc' },
    take: 300,
    include: { user: { select: { name: true, email: true } } },
  });

  return (
    <div>
      <PageHeader title="অডিট লগ" subtitle="প্রতিটি আর্থিক ও গুরুত্বপূর্ণ পরিবর্তনের রেকর্ড (spec §14)।" />
      <div className="overflow-x-auto rounded-lg border border-line bg-white">
        <Table>
          <TableHeader>
            <TableRow><TableHead>সময়</TableHead><TableHead>ইউজার</TableHead><TableHead>অ্যাকশন</TableHead><TableHead>এন্টিটি</TableHead></TableRow>
          </TableHeader>
          <TableBody>
            {logs.length === 0 && <TableRow><TableCell colSpan={4} className="py-10 text-center text-muted-foreground">কোনো লগ নেই।</TableCell></TableRow>}
            {logs.map((l) => (
              <TableRow key={l.id}>
                <TableCell className="whitespace-nowrap text-xs text-muted-foreground">{dt(l.createdAt)}</TableCell>
                <TableCell className="text-sm">{l.user.name}</TableCell>
                <TableCell><Badge variant="secondary">{l.action}</Badge></TableCell>
                <TableCell className="text-xs text-muted-foreground">{l.entity} · {l.entityId}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
