import Link from 'next/link';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { requireStaff } from '@/server/session';
import { prisma } from '@/lib/db';
import { formatBDT } from '@/lib/money';
import { formatKatha } from '@/lib/katha';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PageHeader } from '@/components/admin/page-header';
import { PlotStatusBadge, SaleStatusBadge } from '@/components/admin/status-badge';
import { Pencil } from 'lucide-react';

export const metadata: Metadata = { title: 'প্লট বিবরণ' };

export default async function PlotDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireStaff();
  const { id } = await params;
  const plot = await prisma.plot.findUnique({
    where: { id },
    include: {
      project: { select: { nameEn: true, nameBn: true, slug: true } },
      sales: {
        orderBy: { createdAt: 'desc' },
        include: { customer: { select: { id: true, customerCode: true, fullNameEn: true } } },
      },
    },
  });
  if (!plot) notFound();

  const rows: [string, React.ReactNode][] = [
    ['প্রজেক্ট', plot.project.nameBn ?? plot.project.nameEn],
    ['সেক্টর', plot.sector],
    ['প্লট নম্বর', plot.plotNumber],
    ['সাইজ', formatKatha(plot.sizeKatha.toString(), 'bn')],
    ['ক্যাটাগরি', plot.category === 'RESIDENTIAL' ? 'আবাসিক' : 'বাণিজ্যিক'],
    ['রাস্তা', plot.roadWidthFt ? `${plot.roadWidthFt} ft` : '—'],
    ['মাপ', plot.dimensions ?? '—'],
    ['ফেস', plot.faceDirection ?? '—'],
    ['নির্দেশক মূল্য', plot.basePrice ? formatBDT(plot.basePrice.toString()) : '—'],
    ['স্ট্যাটাস', <PlotStatusBadge key="s" status={plot.status} />],
  ];

  return (
    <div>
      <PageHeader
        title={`প্লট ${plot.plotNumber}`}
        subtitle={`সেক্টর ${plot.sector}`}
        action={
          <Button asChild variant="outline">
            <Link href={`/admin/plots/${plot.id}/edit`}><Pencil className="size-4" /> এডিট</Link>
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>বিবরণ</CardTitle></CardHeader>
          <CardContent>
            <dl className="divide-y divide-line">
              {rows.map(([k, v]) => (
                <div key={k} className="flex justify-between py-2 text-sm">
                  <dt className="text-muted-foreground">{k}</dt>
                  <dd className="font-medium text-ink">{v}</dd>
                </div>
              ))}
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>বিক্রয় ইতিহাস</CardTitle></CardHeader>
          <CardContent className="px-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>সেল কোড</TableHead>
                  <TableHead>কাস্টমার</TableHead>
                  <TableHead>মূল্য</TableHead>
                  <TableHead>স্ট্যাটাস</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {plot.sales.length === 0 && (
                  <TableRow><TableCell colSpan={4} className="py-6 text-center text-muted-foreground">কোনো বিক্রয় নেই।</TableCell></TableRow>
                )}
                {plot.sales.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell><Link href={`/admin/sales/${s.id}`} className="text-navy hover:underline">{s.saleCode}</Link></TableCell>
                    <TableCell><Link href={`/admin/customers/${s.customer.id}`} className="hover:underline">{s.customer.fullNameEn}</Link></TableCell>
                    <TableCell>{formatBDT(s.salePrice.toString())}</TableCell>
                    <TableCell><SaleStatusBadge status={s.status} /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
