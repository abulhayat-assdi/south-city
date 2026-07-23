import type { Metadata } from 'next';
import { requireStaff } from '@/server/session';
import { getActiveProjectId } from '@/server/projects';
import { prisma } from '@/lib/db';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PageHeader } from '@/components/admin/page-header';

export const metadata: Metadata = { title: 'ইনভেন্টরি রিপোর্ট' };

const STATUS_BN: Record<string, string> = { AVAILABLE: 'খালি', RESERVED: 'সংরক্ষিত', BOOKED: 'বুকড', SOLD: 'বিক্রীত' };

export default async function InventoryReportPage() {
  await requireStaff();
  const scope = await getActiveProjectId();
  const where = scope ? { projectId: scope } : {};

  const [byStatus, bySize] = await Promise.all([
    prisma.plot.groupBy({ by: ['status'], where, _count: true }),
    prisma.plot.groupBy({ by: ['sizeKatha', 'status'], where, _count: true, orderBy: { sizeKatha: 'asc' } }),
  ]);

  const sizeMap = new Map<string, Record<string, number>>();
  for (const g of bySize) {
    const key = g.sizeKatha.toString();
    const row = sizeMap.get(key) ?? { AVAILABLE: 0, RESERVED: 0, BOOKED: 0, SOLD: 0 };
    row[g.status] = g._count;
    sizeMap.set(key, row);
  }

  return (
    <div>
      <PageHeader title="ইনভেন্টরি রিপোর্ট" subtitle="স্ট্যাটাস ও সাইজ অনুযায়ী প্লট" />
      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader><CardTitle>স্ট্যাটাস অনুযায়ী</CardTitle></CardHeader>
          <CardContent>
            <dl className="space-y-2">
              {['AVAILABLE', 'RESERVED', 'BOOKED', 'SOLD'].map((s) => (
                <div key={s} className="flex justify-between text-sm">
                  <dt className="text-muted-foreground">{STATUS_BN[s]}</dt>
                  <dd className="text-lg font-bold text-navy">{byStatus.find((g) => g.status === s)?._count ?? 0}</dd>
                </div>
              ))}
            </dl>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>সাইজ অনুযায়ী</CardTitle></CardHeader>
          <CardContent className="px-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>সাইজ</TableHead><TableHead>খালি</TableHead><TableHead>সংরক্ষিত</TableHead>
                  <TableHead>বুকড</TableHead><TableHead>বিক্রীত</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[...sizeMap.entries()].map(([size, row]) => (
                  <TableRow key={size}>
                    <TableCell>{size} কাঠা</TableCell>
                    <TableCell>{row.AVAILABLE}</TableCell>
                    <TableCell>{row.RESERVED}</TableCell>
                    <TableCell>{row.BOOKED}</TableCell>
                    <TableCell>{row.SOLD}</TableCell>
                  </TableRow>
                ))}
                {sizeMap.size === 0 && <TableRow><TableCell colSpan={5} className="py-6 text-center text-muted-foreground">কোনো প্লট নেই।</TableCell></TableRow>}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
