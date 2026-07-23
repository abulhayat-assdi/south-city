import Link from 'next/link';
import type { Metadata } from 'next';
import { Prisma } from '@prisma/client';
import { requireStaff } from '@/server/session';
import { prisma } from '@/lib/db';
import { formatBDT } from '@/lib/money';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PageHeader } from '@/components/admin/page-header';
import { getActiveProjectId } from '@/server/projects';
import { Download } from 'lucide-react';

export const metadata: Metadata = { title: 'পেমেন্ট' };

const METHOD: Record<string, string> = {
  CASH: 'নগদ', BANK_TRANSFER: 'ব্যাংক', CHEQUE: 'চেক', BKASH: 'বিকাশ', NAGAD: 'নগদ', OTHER: 'অন্যান্য',
};
const dmy = (d: Date) => d.toLocaleDateString('en-GB');

interface SearchParams { project?: string; method?: string; from?: string; to?: string }

export default async function PaymentsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  await requireStaff();
  const sp = await searchParams;
  const activeProject = await getActiveProjectId(sp.project);

  const where: Prisma.PaymentWhereInput = { isVoided: false };
  if (activeProject) where.sale = { projectId: activeProject };
  if (sp.method) where.method = sp.method as Prisma.PaymentWhereInput['method'];
  if (sp.from || sp.to) {
    where.paymentDate = {};
    if (sp.from) where.paymentDate.gte = new Date(sp.from);
    if (sp.to) where.paymentDate.lte = new Date(sp.to);
  }

  const payments = await prisma.payment.findMany({
    where,
    orderBy: [{ paymentDate: 'desc' }, { createdAt: 'desc' }],
    take: 200,
    include: {
      sale: {
        select: {
          id: true,
          saleCode: true,
          project: { select: { nameEn: true, nameBn: true } },
          customer: { select: { id: true, fullNameEn: true } },
        },
      },
    },
  });

  const total = payments.reduce((acc, p) => acc + Number(p.amount), 0);

  return (
    <div>
      <PageHeader title="পেমেন্ট" subtitle={`${payments.length} টি · মোট ${formatBDT(total)}`} />

      <form className="mb-4 grid gap-3 rounded-lg border border-line bg-white p-4 sm:grid-cols-2 lg:grid-cols-5">
        <Select name="method" defaultValue={sp.method ?? ''}>
          <option value="">সব মাধ্যম</option>
          {Object.entries(METHOD).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </Select>
        <label className="text-sm text-muted-foreground">শুরু<Input name="from" type="date" defaultValue={sp.from ?? ''} /></label>
        <label className="text-sm text-muted-foreground">শেষ<Input name="to" type="date" defaultValue={sp.to ?? ''} /></label>
        <div className="flex items-end gap-2 lg:col-span-2">
          <Button type="submit" className="flex-1">ফিল্টার</Button>
          <Button asChild variant="ghost"><Link href="/admin/payments">রিসেট</Link></Button>
        </div>
      </form>

      <div className="rounded-lg border border-line bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>রশিদ</TableHead><TableHead>তারিখ</TableHead><TableHead>প্রজেক্ট</TableHead>
              <TableHead>কাস্টমার</TableHead><TableHead>অঙ্ক</TableHead><TableHead>মাধ্যম</TableHead><TableHead>PDF</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payments.length === 0 && (
              <TableRow><TableCell colSpan={7} className="py-10 text-center text-muted-foreground">কোনো পেমেন্ট নেই।</TableCell></TableRow>
            )}
            {payments.map((p) => (
              <TableRow key={p.id}>
                <TableCell className="font-mono text-xs">
                  <Link href={`/admin/sales/${p.sale.id}`} className="text-navy hover:underline">{p.receiptNo}</Link>
                </TableCell>
                <TableCell>{dmy(p.paymentDate)}</TableCell>
                <TableCell className="text-xs text-muted-foreground">{p.sale.project.nameBn ?? p.sale.project.nameEn}</TableCell>
                <TableCell><Link href={`/admin/customers/${p.sale.customer.id}`} className="hover:underline">{p.sale.customer.fullNameEn}</Link></TableCell>
                <TableCell>{formatBDT(p.amount.toString())}</TableCell>
                <TableCell>{METHOD[p.method] ?? p.method}</TableCell>
                <TableCell>
                  <a href={`/api/receipts/${p.id}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-navy hover:underline">
                    <Download className="size-3.5" /> PDF
                  </a>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
