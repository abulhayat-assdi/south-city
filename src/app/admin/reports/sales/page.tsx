import Link from 'next/link';
import type { Metadata } from 'next';
import { requireStaff } from '@/server/session';
import { getActiveProjectId } from '@/server/projects';
import { salesReport } from '@/server/services/reports';
import { formatBDT } from '@/lib/money';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PageHeader } from '@/components/admin/page-header';
import { Download } from 'lucide-react';

export const metadata: Metadata = { title: 'বিক্রয় রিপোর্ট' };

interface SP { project?: string; size?: string; sector?: string; ptype?: string; from?: string; to?: string }

export default async function SalesReportPage({ searchParams }: { searchParams: Promise<SP> }) {
  await requireStaff();
  const sp = await searchParams;
  const scope = await getActiveProjectId(sp.project);
  const rows = await salesReport(scope, { size: sp.size, sector: sp.sector, type: sp.ptype, from: sp.from, to: sp.to });

  const csvQs = new URLSearchParams({ type: 'sales', ...clean(sp) }).toString();

  return (
    <div>
      <PageHeader
        title="কে কী কিনেছে"
        subtitle={`${rows.length} টি বিক্রয়`}
        action={<Button asChild variant="outline"><a href={`/api/reports?${csvQs}`}><Download className="size-4" /> CSV</a></Button>}
      />

      <form className="mb-4 grid gap-3 rounded-lg border border-line bg-white p-4 sm:grid-cols-3 lg:grid-cols-6">
        <Select name="size" defaultValue={sp.size ?? ''}>
          <option value="">সব সাইজ</option>{[3, 5, 10].map((s) => <option key={s} value={s}>{s} কাঠা</option>)}
        </Select>
        <Select name="sector" defaultValue={sp.sector ?? ''}>
          <option value="">সব সেক্টর</option>{['A', 'B', 'C', 'D'].map((s) => <option key={s} value={s}>সেক্টর {s}</option>)}
        </Select>
        <Select name="ptype" defaultValue={sp.ptype ?? ''}>
          <option value="">সব ধরন</option><option value="FULL">সম্পূর্ণ</option><option value="INSTALLMENT">কিস্তি</option>
        </Select>
        <Input name="from" type="date" defaultValue={sp.from ?? ''} />
        <Input name="to" type="date" defaultValue={sp.to ?? ''} />
        <div className="flex gap-2">
          <Button type="submit" className="flex-1">ফিল্টার</Button>
          <Button asChild variant="ghost"><Link href="/admin/reports/sales">রিসেট</Link></Button>
        </div>
      </form>

      <div className="overflow-x-auto rounded-lg border border-line bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>সেল</TableHead><TableHead>প্রজেক্ট</TableHead><TableHead>প্লট</TableHead>
              <TableHead>কাস্টমার</TableHead><TableHead>মূল্য</TableHead><TableHead>পরিশোধিত</TableHead>
              <TableHead>বকেয়া</TableHead><TableHead>তারিখ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 && <TableRow><TableCell colSpan={8} className="py-10 text-center text-muted-foreground">কোনো তথ্য নেই।</TableCell></TableRow>}
            {rows.map((r) => (
              <TableRow key={r.saleCode}>
                <TableCell className="font-mono text-xs">{r.saleCode}</TableCell>
                <TableCell className="text-xs text-muted-foreground">{r.project}</TableCell>
                <TableCell>{r.plot} ({r.sizeKatha}k)</TableCell>
                <TableCell>{r.customer}</TableCell>
                <TableCell>{formatBDT(r.salePrice)}</TableCell>
                <TableCell>{formatBDT(r.paid)}</TableCell>
                <TableCell className={Number(r.outstanding) > 0 ? 'text-red-700' : ''}>{formatBDT(r.outstanding)}</TableCell>
                <TableCell>{r.bookingDate}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function clean(sp: SP): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(sp)) if (v) out[k] = v;
  return out;
}
