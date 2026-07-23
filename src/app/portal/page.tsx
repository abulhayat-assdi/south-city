import Link from 'next/link';
import type { Metadata } from 'next';
import { requireCustomer } from '@/server/session';
import { prisma } from '@/lib/db';
import { formatBDT, toPoisha, toDecimalString, sum } from '@/lib/money';
import { formatKatha } from '@/lib/katha';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { SaleStatusBadge } from '@/components/admin/status-badge';

export const metadata: Metadata = { title: 'আমার পোর্টাল' };
const dmy = (d: Date) => d.toLocaleDateString('en-GB');

export default async function PortalHomePage() {
  const user = await requireCustomer();

  // A CUSTOMER only ever loads their own rows (spec §5/§14).
  const customer = await prisma.customer.findUnique({
    where: { id: user.customerId! },
    include: {
      documents: { orderBy: { createdAt: 'desc' } },
      sales: {
        orderBy: { createdAt: 'desc' },
        include: {
          project: { select: { nameEn: true, nameBn: true } },
          plot: { select: { sector: true, plotNumber: true, sizeKatha: true } },
          installments: { orderBy: { installmentNo: 'asc' } },
          payments: { where: { isVoided: false }, select: { amount: true } },
        },
      },
    },
  });
  if (!customer) return <p>তথ্য পাওয়া যায়নি।</p>;

  let grandPrice = 0n, grandPaid = 0n;
  const sales = customer.sales.map((s) => {
    const price = toPoisha(s.salePrice.toString());
    const paid = sum(s.payments.map((p) => toPoisha(p.amount.toString())));
    if (s.status !== 'CANCELLED') { grandPrice += price; grandPaid += paid; }
    const nextDue = s.installments.find((i) => i.status !== 'PAID');
    return { s, price, paid, outstanding: price - paid, nextDue };
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">আসসালামু আলাইকুম, {customer.fullNameBn ?? customer.fullNameEn}</h1>
        <p className="text-sm text-muted-foreground">কাস্টমার কোড: {customer.customerCode}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Summary label="মোট মূল্য" value={formatBDT(toDecimalString(grandPrice))} />
        <Summary label="মোট পরিশোধিত" value={formatBDT(toDecimalString(grandPaid))} tone="green" />
        <Summary label="মোট বকেয়া" value={formatBDT(toDecimalString(grandPrice - grandPaid))} tone={grandPrice - grandPaid > 0n ? 'red' : 'default'} />
      </div>

      <Card>
        <CardHeader><CardTitle>আমার প্লট ও বিক্রয়</CardTitle></CardHeader>
        <CardContent className="px-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>প্রজেক্ট</TableHead><TableHead>প্লট</TableHead><TableHead>মূল্য</TableHead>
                <TableHead>পরিশোধিত</TableHead><TableHead>বকেয়া</TableHead><TableHead>পরবর্তী কিস্তি</TableHead>
                <TableHead>স্ট্যাটাস</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sales.length === 0 && <TableRow><TableCell colSpan={7} className="py-8 text-center text-muted-foreground">এখনো কোনো বিক্রয় নেই।</TableCell></TableRow>}
              {sales.map(({ s, price, paid, outstanding, nextDue }) => (
                <TableRow key={s.id}>
                  <TableCell className="text-sm">{s.project.nameBn ?? s.project.nameEn}</TableCell>
                  <TableCell>
                    <Link href={`/portal/sales/${s.id}`} className="font-medium text-navy hover:underline">
                      {s.plot.plotNumber}
                    </Link>
                    <div className="text-xs text-muted-foreground">{formatKatha(s.plot.sizeKatha.toString(), 'bn')}</div>
                  </TableCell>
                  <TableCell>{formatBDT(toDecimalString(price))}</TableCell>
                  <TableCell>{formatBDT(toDecimalString(paid))}</TableCell>
                  <TableCell className={outstanding > 0n ? 'text-red-700' : ''}>{formatBDT(toDecimalString(outstanding))}</TableCell>
                  <TableCell>{nextDue ? dmy(nextDue.dueDate) : '—'}</TableCell>
                  <TableCell><SaleStatusBadge status={s.status} /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>আমার ডকুমেন্ট</CardTitle></CardHeader>
        <CardContent>
          {customer.documents.length === 0 ? (
            <p className="text-sm text-muted-foreground">কোনো ডকুমেন্ট নেই।</p>
          ) : (
            <ul className="divide-y divide-line">
              {customer.documents.map((d) => (
                <li key={d.id} className="flex items-center justify-between py-2 text-sm">
                  <span>{d.fileName}</span>
                  <a href={`/api/documents/${d.id}`} target="_blank" rel="noreferrer" className="text-navy hover:underline">দেখুন</a>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground">প্রোফাইল সংশোধনের প্রয়োজন হলে অফিসে যোগাযোগ করুন।</p>
    </div>
  );
}

function Summary({ label, value, tone = 'default' }: { label: string; value: string; tone?: 'default' | 'green' | 'red' }) {
  const color = tone === 'green' ? 'text-green-700' : tone === 'red' ? 'text-red-700' : 'text-navy';
  return (
    <Card><CardContent className="p-4"><div className="text-sm text-muted-foreground">{label}</div><div className={`mt-1 text-xl font-bold ${color}`}>{value}</div></CardContent></Card>
  );
}
