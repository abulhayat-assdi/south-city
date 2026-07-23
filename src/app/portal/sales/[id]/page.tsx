import Link from 'next/link';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { requireCustomer } from '@/server/session';
import { prisma } from '@/lib/db';
import { formatBDT, toPoisha, toDecimalString, sum } from '@/lib/money';
import { formatKatha } from '@/lib/katha';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { InstallmentStatusBadge } from '@/components/admin/status-badge';
import { ArrowLeft, Download } from 'lucide-react';

export const metadata: Metadata = { title: 'বিক্রয় বিবরণ' };
const dmy = (d: Date) => d.toLocaleDateString('en-GB');
const METHOD: Record<string, string> = { CASH: 'নগদ', BANK_TRANSFER: 'ব্যাংক', CHEQUE: 'চেক', BKASH: 'বিকাশ', NAGAD: 'নগদ', OTHER: 'অন্যান্য' };

export default async function PortalSaleDetail({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireCustomer();
  const { id } = await params;

  const sale = await prisma.sale.findUnique({
    where: { id },
    include: {
      project: { select: { nameEn: true, nameBn: true } },
      plot: { select: { plotNumber: true, sizeKatha: true } },
      installments: { orderBy: { installmentNo: 'asc' } },
      payments: { orderBy: [{ paymentDate: 'desc' }] },
    },
  });
  // Ownership enforcement — a customer can never see another's sale (spec §5/§14).
  if (!sale || sale.customerId !== user.customerId) notFound();

  const price = toPoisha(sale.salePrice.toString());
  const paid = sum(sale.payments.filter((p) => !p.isVoided).map((p) => toPoisha(p.amount.toString())));

  return (
    <div className="space-y-6">
      <Link href="/portal" className="inline-flex items-center gap-1 text-sm text-navy hover:underline">
        <ArrowLeft className="size-4" /> ফিরে যান
      </Link>

      <div>
        <h1 className="text-2xl font-bold">{sale.saleCode}</h1>
        <p className="text-sm text-muted-foreground">
          {sale.project.nameBn ?? sale.project.nameEn} · প্লট {sale.plot.plotNumber} · {formatKatha(sale.plot.sizeKatha.toString(), 'bn')}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Summary label="বিক্রয়মূল্য" value={formatBDT(sale.salePrice.toString())} />
        <Summary label="পরিশোধিত" value={formatBDT(toDecimalString(paid))} tone="green" />
        <Summary label="বকেয়া" value={formatBDT(toDecimalString(price - paid))} tone={price - paid > 0n ? 'red' : 'default'} />
      </div>

      {sale.paymentType === 'INSTALLMENT' && (
        <Card>
          <CardHeader><CardTitle>কিস্তি সূচি</CardTitle></CardHeader>
          <CardContent className="px-0">
            <Table>
              <TableHeader><TableRow><TableHead>#</TableHead><TableHead>তারিখ</TableHead><TableHead>বকেয়া</TableHead><TableHead>পরিশোধিত</TableHead><TableHead>স্ট্যাটাস</TableHead></TableRow></TableHeader>
              <TableBody>
                {sale.installments.map((i) => (
                  <TableRow key={i.id}>
                    <TableCell>{i.installmentNo}</TableCell>
                    <TableCell>{dmy(i.dueDate)}</TableCell>
                    <TableCell>{formatBDT(i.amountDue.toString())}</TableCell>
                    <TableCell>{formatBDT(i.amountPaid.toString())}</TableCell>
                    <TableCell><InstallmentStatusBadge status={i.status} /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle>পেমেন্ট ইতিহাস</CardTitle></CardHeader>
        <CardContent className="px-0">
          <Table>
            <TableHeader><TableRow><TableHead>রশিদ</TableHead><TableHead>তারিখ</TableHead><TableHead>অঙ্ক</TableHead><TableHead>মাধ্যম</TableHead><TableHead>PDF</TableHead></TableRow></TableHeader>
            <TableBody>
              {sale.payments.filter((p) => !p.isVoided).length === 0 && (
                <TableRow><TableCell colSpan={5} className="py-6 text-center text-muted-foreground">কোনো পেমেন্ট নেই।</TableCell></TableRow>
              )}
              {sale.payments.filter((p) => !p.isVoided).map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-mono text-xs">{p.receiptNo}</TableCell>
                  <TableCell>{dmy(p.paymentDate)}</TableCell>
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
        </CardContent>
      </Card>
    </div>
  );
}

function Summary({ label, value, tone = 'default' }: { label: string; value: string; tone?: 'default' | 'green' | 'red' }) {
  const color = tone === 'green' ? 'text-green-700' : tone === 'red' ? 'text-red-700' : 'text-navy';
  return <Card><CardContent className="p-4"><div className="text-sm text-muted-foreground">{label}</div><div className={`mt-1 text-xl font-bold ${color}`}>{value}</div></CardContent></Card>;
}
