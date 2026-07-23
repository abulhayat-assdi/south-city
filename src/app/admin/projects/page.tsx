import Link from 'next/link';
import type { Metadata } from 'next';
import { requireStaff } from '@/server/session';
import { prisma } from '@/lib/db';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PageHeader } from '@/components/admin/page-header';
import { Plus } from 'lucide-react';

export const metadata: Metadata = { title: 'প্রজেক্ট' };

const STATUS: Record<string, string> = { UPCOMING: 'আসন্ন', ONGOING: 'চলমান', COMPLETED: 'সম্পন্ন' };

export default async function ProjectsPage() {
  await requireStaff();
  const projects = await prisma.project.findMany({
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
    include: { _count: { select: { plots: true, sales: true } } },
  });

  return (
    <div>
      <PageHeader
        title="প্রজেক্টসমূহ"
        subtitle="নতুন প্রজেক্ট (যেমন North City) এখান থেকেই যোগ করুন — কোনো কোড পরিবর্তন লাগে না।"
        action={
          <Button asChild>
            <Link href="/admin/projects/new"><Plus className="size-4" /> নতুন প্রজেক্ট</Link>
          </Button>
        }
      />
      <div className="rounded-lg border border-line bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>প্রজেক্ট</TableHead>
              <TableHead>লোকেশন</TableHead>
              <TableHead>স্ট্যাটাস</TableHead>
              <TableHead>প্লট</TableHead>
              <TableHead>বিক্রয়</TableHead>
              <TableHead>প্রকাশ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {projects.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">কোনো প্রজেক্ট নেই।</TableCell>
              </TableRow>
            )}
            {projects.map((p) => (
              <TableRow key={p.id}>
                <TableCell>
                  <Link href={`/admin/projects/${p.slug}`} className="font-medium text-navy hover:underline">
                    {p.nameBn ?? p.nameEn}
                  </Link>
                  <div className="text-xs text-muted-foreground">/{p.slug}</div>
                </TableCell>
                <TableCell>{p.locationBn ?? p.locationEn ?? '—'}</TableCell>
                <TableCell><Badge variant="secondary">{STATUS[p.status] ?? p.status}</Badge></TableCell>
                <TableCell>{p._count.plots}</TableCell>
                <TableCell>{p._count.sales}</TableCell>
                <TableCell>
                  {p.isPublished ? <Badge variant="success">প্রকাশিত</Badge> : <Badge variant="secondary">খসড়া</Badge>}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
