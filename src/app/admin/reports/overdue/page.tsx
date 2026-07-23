import Link from 'next/link';
import type { Metadata } from 'next';
import { requireStaff } from '@/server/session';
import { getActiveProjectId } from '@/server/projects';
import { overdueReport } from '@/server/services/reports';
import { formatBDT, toDecimalString, toPoisha } from '@/lib/money';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PageHeader } from '@/components/admin/page-header';
import { Download } from 'lucide-react';

export const metadata: Metadata = { title: 'মেয়াদোত্তীর্ণ কিস্তি' };
const dmy = (d: Date) => d.toLocaleDateString('en-GB');

export default async function OverdueReportPage() {
  await requireStaff();
  const scope = await getActiveProjectId();
  const rows = await overdueReport(scope);

  return (
    <div>
      <PageHeader
        title="মেয়াদোত্তীর্ণ কিস্তি"
        subtitle={`${rows.length} টি কিস্তি বকেয়া`}
        action={<Button asChild variant="outline"><a href="/api/reports?type=overdue"><Download className="size-4" /> CSV</a></Button>}
      />
      <div className="overflow-x-auto rounded-lg border border-line bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>কাস্টমার</TableHead><TableHead>ফোন</TableHead><TableHead>প্রজেক্ট / প্লট</TableHead>
              <TableHead>কিস্তি</TableHead><TableHead>শেষ তারিখ</TableHead><TableHead>বকেয়া</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 && <TableRow><TableCell colSpan={6} className="py-10 text-center text-muted-foreground">কোনো মেয়াদোত্তীর্ণ কিস্তি নেই। 🎉</TableCell></TableRow>}
            {rows.map((r) => {
              const remaining = toPoisha(r.amountDue.toString()) - toPoisha(r.amountPaid.toString());
              return (
                <TableRow key={r.id}>
                  <TableCell><Link href={`/admin/sales/${r.sale.id}`} className="text-navy hover:underline">{r.sale.customer.fullNameEn}</Link></TableCell>
                  <TableCell dir="ltr">{r.sale.customer.phonePrimary}</TableCell>
                  <TableCell className="text-sm">{r.sale.project.nameEn} · {r.sale.plot.plotNumber}</TableCell>
                  <TableCell>#{r.installmentNo}</TableCell>
                  <TableCell className="text-red-700">{dmy(r.dueDate)}</TableCell>
                  <TableCell>{formatBDT(toDecimalString(remaining))}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
