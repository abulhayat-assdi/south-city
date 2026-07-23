import Link from 'next/link';
import type { Metadata } from 'next';
import { requireStaff } from '@/server/session';
import { getActiveProjectId } from '@/server/projects';
import { salesReport } from '@/server/services/reports';
import { formatBDT } from '@/lib/money';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PageHeader } from '@/components/admin/page-header';
import { Download } from 'lucide-react';

export const metadata: Metadata = { title: 'বকেয়া রিপোর্ট' };

export default async function DuesReportPage() {
  await requireStaff();
  const scope = await getActiveProjectId();
  const rows = (await salesReport(scope, {})).filter((r) => Number(r.outstanding) > 0);
  const totalDue = rows.reduce((a, r) => a + Number(r.outstanding), 0);

  return (
    <div>
      <PageHeader
        title="বকেয়া রিপোর্ট"
        subtitle={`${rows.length} টি বিক্রয়ে মোট বকেয়া ${formatBDT(totalDue.toFixed(2))}`}
        action={<Button asChild variant="outline"><a href="/api/reports?type=sales"><Download className="size-4" /> CSV</a></Button>}
      />
      <div className="overflow-x-auto rounded-lg border border-line bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>সেল</TableHead><TableHead>প্রজেক্ট</TableHead><TableHead>কাস্টমার</TableHead>
              <TableHead>ফোন</TableHead><TableHead>মূল্য</TableHead><TableHead>পরিশোধিত</TableHead><TableHead>বকেয়া</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 && <TableRow><TableCell colSpan={7} className="py-10 text-center text-muted-foreground">কোনো বকেয়া নেই। 🎉</TableCell></TableRow>}
            {rows.map((r) => (
              <TableRow key={r.saleCode}>
                <TableCell className="font-mono text-xs">{r.saleCode}</TableCell>
                <TableCell className="text-xs text-muted-foreground">{r.project}</TableCell>
                <TableCell>{r.customer}</TableCell>
                <TableCell dir="ltr">{r.phone}</TableCell>
                <TableCell>{formatBDT(r.salePrice)}</TableCell>
                <TableCell>{formatBDT(r.paid)}</TableCell>
                <TableCell className="font-medium text-red-700">{formatBDT(r.outstanding)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
