import Link from 'next/link';
import type { Metadata } from 'next';
import { requireAdmin } from '@/server/session';
import { prisma } from '@/lib/db';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PageHeader } from '@/components/admin/page-header';
import { Plus } from 'lucide-react';

export const metadata: Metadata = { title: 'নিউজ' };

export default async function NewsAdminPage() {
  await requireAdmin();
  const posts = await prisma.newsPost.findMany({ orderBy: { createdAt: 'desc' } });

  return (
    <div>
      <PageHeader
        title="নিউজ ও নোটিশ"
        action={<Button asChild><Link href="/admin/content/news/new"><Plus className="size-4" /> নতুন পোস্ট</Link></Button>}
      />
      <div className="rounded-lg border border-line bg-white">
        <Table>
          <TableHeader><TableRow><TableHead>শিরোনাম</TableHead><TableHead>Slug</TableHead><TableHead>স্ট্যাটাস</TableHead></TableRow></TableHeader>
          <TableBody>
            {posts.length === 0 && <TableRow><TableCell colSpan={3} className="py-10 text-center text-muted-foreground">কোনো পোস্ট নেই।</TableCell></TableRow>}
            {posts.map((p) => (
              <TableRow key={p.id}>
                <TableCell><Link href={`/admin/content/news/${p.id}`} className="font-medium text-navy hover:underline">{p.titleBn ?? p.titleEn}</Link></TableCell>
                <TableCell className="font-mono text-xs text-muted-foreground">/{p.slug}</TableCell>
                <TableCell>{p.isPublished ? <Badge variant="success">প্রকাশিত</Badge> : <Badge variant="secondary">খসড়া</Badge>}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
