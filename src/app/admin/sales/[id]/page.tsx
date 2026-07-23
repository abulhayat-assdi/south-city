import Link from 'next/link';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { requireStaff } from '@/server/session';
import { prisma } from '@/lib/db';
import { formatBDT, toPoisha, toDecimalString, sum } from '@/lib/money';
import { formatKatha } from '@/lib/katha';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PageHeader } from '@/components/admin/page-header';
import { SaleStatusBadge, InstallmentStatusBadge } from '@/components/admin/status-badge';
import { RecordPaymentForm } from '@/components/admin/record-payment-form';
import { VoidPaymentButton } from '@/components/admin/void-payment-button';
import { CancelSaleButton } from '@/components/admin/cancel-sale-button';
import { Download } from 'lucide-react';

export const metadata: Metadata = { title: 'বিক্রয় বিবরণ' };

const METHOD: Record<string, string> = {
  CASH: 'নগদ', BANK_TRANSFER: 'ব্যাংক', CHEQUE: 'চেক', BKASH: 'বিকাশ', NAGAD: 'নগদ', OTHER: 'অন্যান্য',
};
const dmy = (d: Date) => d.toLocaleDateString('en-GB');

export default async function SaleDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireStaff();
  const { id } = await params;

  const sale = await prisma.sale.findUnique({
    where: { id },
    include: {
      project: { select: { nameEn: true, nameBn: true } },
      plot: { select: { id: true, sector: true, plotNumber: true, sizeKatha: true } },
      customer: { select: { id: true, fullNameEn: true, customerCode: true, phonePrimary: true } },
      installments: { orderBy: { installmentNo: 'asc' } },
      payments: { orderBy: [{ paymentDate: 'desc' }, { createdAt: 'desc' }] },
    },
  });
  if (!sale) notFound();

  const price = toPoisha(sale.salePrice.toString());
  const paid = sum(sale.payments.filter((p) => !p.isVoided).map((p) => toPoisha(p.amount.toString())));
  const outstanding = price - paid;

  const nextDue = sale.installments.find((i) => i.status !== 'PAID');

  const installmentOptions = sale.installments
    .filter((i) => i.status !== 'PAID')
    .map((i) => ({
      id: i.id,
      label: `কিস্তি ${i.installmentNo} · বাকি ${formatBDT(
        toDecimalString(toPoisha(i.amountDue.toString()) - toPoisha(i.amountPaid.toString())),
      )}`,
    }));

  return (
    <div>
      <PageHeader
        title={sale.saleCode}
        subtitle={`${sale.project.nameBn ?? sale.project.nameEn} · প্লট ${sale.plot.plotNumber} · ${formatKatha(sale.plot.sizeKatha.toString(), 'bn')}`}
        action={
          <div className="flex items-center gap-2">
            <SaleStatusBadge status={sale.status} />
            {sale.status !== 'CANCELLED' && <CancelSaleButton saleId={sale.id} />}
          </div>
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-4">
        <Summary label="বিক্রয়মূল্য" value={formatBDT(sale.salePrice.toString())} />
        <Summary label="পরিশোধিত" value={formatBDT(toDecimalString(paid))} tone="green" />
        <Summary label="বকেয়া" value={formatBDT(toDecimalString(outstanding))} tone={outstanding > 0n ? 'red' : 'default'} />
        <Summary label="পরবর্তী কিস্তি" value={nextDue ? dmy(nextDue.dueDate) : '—'} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {sale.paymentType === 'INSTALLMENT' && (
            <Card>
              <CardHeader><CardTitle>কিস্তি সূচি</CardTitle></CardHeader>
              <CardContent className="px-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>#</TableHead><TableHead>তারিখ</TableHead>
                      <TableHead>বকেয়া</TableHead><TableHead>পরিশোধিত</TableHead><TableHead>স্ট্যাটাস</TableHead>
                    </TableRow>
                  </TableHeader>
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
                <TableHeader>
                  <TableRow>
                    <TableHead>রশিদ</TableHead><TableHead>তারিখ</TableHead><TableHead>অঙ্ক</TableHead>
                    <TableHead>মাধ্যম</TableHead><TableHead>রশিদ PDF</TableHead>
                    {user.role === 'ADMIN' && <TableHead></TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sale.payments.length === 0 && (
                    <TableRow><TableCell colSpan={6} className="py-6 text-center text-muted-foreground">কোনো পেমেন্ট নেই।</TableCell></TableRow>
                  )}
                  {sale.payments.map((p) => (
                    <TableRow key={p.id} className={p.isVoided ? 'opacity-50' : ''}>
                      <TableCell className="font-mono text-xs">
                        {p.receiptNo}
                        {p.isVoided && <span className="ml-1 text-red-600">(ভয়েড)</span>}
                      </TableCell>
                      <TableCell>{dmy(p.paymentDate)}</TableCell>
                      <TableCell className={p.isVoided ? 'line-through' : ''}>{formatBDT(p.amount.toString())}</TableCell>
                      <TableCell>{METHOD[p.method] ?? p.method}</TableCell>
                      <TableCell>
                        {!p.isVoided && (
                          <a href={`/api/receipts/${p.id}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-navy hover:underline">
                            <Download className="size-3.5" /> PDF
                          </a>
                        )}
                      </TableCell>
                      {user.role === 'ADMIN' && (
                        <TableCell>{!p.isVoided && <VoidPaymentButton paymentId={p.id} />}</TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle>কাস্টমার</CardTitle></CardHeader>
            <CardContent className="text-sm">
              <Link href={`/admin/customers/${sale.customer.id}`} className="font-medium text-navy hover:underline">
                {sale.customer.fullNameEn}
              </Link>
              <div className="text-muted-foreground">{sale.customer.customerCode}</div>
              <div dir="ltr" className="text-muted-foreground">{sale.customer.phonePrimary}</div>
            </CardContent>
          </Card>

          {sale.status !== 'CANCELLED' && (
            <Card>
              <CardHeader><CardTitle>পেমেন্ট রেকর্ড</CardTitle></CardHeader>
              <CardContent>
                <RecordPaymentForm saleId={sale.id} installments={installmentOptions} />
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

function Summary({ label, value, tone = 'default' }: { label: string; value: string; tone?: 'default' | 'green' | 'red' }) {
  const color = tone === 'green' ? 'text-green-700' : tone === 'red' ? 'text-red-700' : 'text-navy';
  return (
    <Card>
      <CardContent className="p-4">
        <div className="text-sm text-muted-foreground">{label}</div>
        <div className={`mt-1 text-xl font-bold ${color}`}>{value}</div>
      </CardContent>
    </Card>
  );
}
