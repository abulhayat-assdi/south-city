import Link from 'next/link';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { requireStaff } from '@/server/session';
import { prisma } from '@/lib/db';
import { formatBDT, toPoisha, toDecimalString } from '@/lib/money';
import { formatKatha } from '@/lib/katha';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PageHeader } from '@/components/admin/page-header';
import { SaleStatusBadge } from '@/components/admin/status-badge';
import { CreateLoginButton } from '@/components/admin/create-login-button';
import { DocumentManager } from '@/components/admin/document-manager';
import { Pencil, Plus } from 'lucide-react';

export const metadata: Metadata = { title: 'কাস্টমার বিবরণ' };

export default async function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireStaff();
  const { id } = await params;

  const c = await prisma.customer.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, email: true, isActive: true } },
      documents: { orderBy: { createdAt: 'desc' } },
      sales: {
        orderBy: { createdAt: 'desc' },
        include: {
          plot: { select: { sector: true, plotNumber: true, sizeKatha: true } },
          project: { select: { nameEn: true, nameBn: true } },
        },
      },
    },
  });
  if (!c) notFound();

  // Financials: total price (non-cancelled) vs total non-voided payments.
  const priceAgg = await prisma.sale.aggregate({
    where: { customerId: id, status: { not: 'CANCELLED' } },
    _sum: { salePrice: true },
  });
  const paidAgg = await prisma.payment.aggregate({
    where: { isVoided: false, sale: { customerId: id, status: { not: 'CANCELLED' } } },
    _sum: { amount: true },
  });
  const totalPrice = toPoisha(priceAgg._sum.salePrice?.toString() ?? '0');
  const totalPaid = toPoisha(paidAgg._sum.amount?.toString() ?? '0');
  const balance = totalPrice - totalPaid;

  const profile: [string, React.ReactNode][] = [
    ['পিতা', c.fatherName ?? '—'],
    ['মাতা', c.motherName ?? '—'],
    ['স্বামী/স্ত্রী', c.spouseName ?? '—'],
    ['NID', c.nidNumber ?? '—'],
    ['জন্মতারিখ', c.dateOfBirth ? c.dateOfBirth.toLocaleDateString('en-GB') : '—'],
    ['পেশা', c.occupation ?? '—'],
    ['মোবাইল', c.phonePrimary],
    ['বিকল্প মোবাইল', c.phoneSecondary ?? '—'],
    ['ইমেইল', c.email ?? '—'],
    ['বর্তমান ঠিকানা', c.presentAddress ?? '—'],
    ['স্থায়ী ঠিকানা', c.permanentAddress ?? '—'],
  ];
  const nominee: [string, React.ReactNode][] = [
    ['নাম', c.nomineeName ?? '—'],
    ['সম্পর্ক', c.nomineeRelation ?? '—'],
    ['NID', c.nomineeNid ?? '—'],
    ['মোবাইল', c.nomineePhone ?? '—'],
    ['ঠিকানা', c.nomineeAddress ?? '—'],
  ];

  return (
    <div>
      <PageHeader
        title={c.fullNameEn}
        subtitle={`${c.customerCode}${c.fullNameBn ? ' · ' + c.fullNameBn : ''}`}
        action={
          <div className="flex gap-2">
            <Button asChild variant="outline"><Link href={`/admin/customers/${c.id}/edit`}><Pencil className="size-4" /> এডিট</Link></Button>
            <Button asChild><Link href={`/admin/sales/new?customerId=${c.id}`}><Plus className="size-4" /> নতুন বিক্রয়</Link></Button>
          </div>
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <SummaryCard label="মোট মূল্য" value={formatBDT(toDecimalString(totalPrice))} />
        <SummaryCard label="পরিশোধিত" value={formatBDT(toDecimalString(totalPaid))} tone="green" />
        <SummaryCard label="বকেয়া" value={formatBDT(toDecimalString(balance))} tone={balance > 0n ? 'red' : 'default'} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader><CardTitle>প্রোফাইল</CardTitle></CardHeader>
            <CardContent>
              <dl className="grid gap-x-6 sm:grid-cols-2">
                {profile.map(([k, v]) => (
                  <div key={k} className="flex justify-between border-b border-line py-2 text-sm">
                    <dt className="text-muted-foreground">{k}</dt>
                    <dd className="text-right font-medium text-ink">{v}</dd>
                  </div>
                ))}
              </dl>
              <h3 className="mb-2 mt-5 font-display text-sm font-semibold text-navy">নমিনি</h3>
              <dl className="grid gap-x-6 sm:grid-cols-2">
                {nominee.map(([k, v]) => (
                  <div key={k} className="flex justify-between border-b border-line py-2 text-sm">
                    <dt className="text-muted-foreground">{k}</dt>
                    <dd className="text-right font-medium text-ink">{v}</dd>
                  </div>
                ))}
              </dl>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>প্লট ও বিক্রয়</CardTitle></CardHeader>
            <CardContent className="px-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>সেল কোড</TableHead>
                    <TableHead>প্রজেক্ট</TableHead>
                    <TableHead>প্লট</TableHead>
                    <TableHead>সাইজ</TableHead>
                    <TableHead>মূল্য</TableHead>
                    <TableHead>স্ট্যাটাস</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {c.sales.length === 0 && (
                    <TableRow><TableCell colSpan={6} className="py-6 text-center text-muted-foreground">কোনো বিক্রয় নেই।</TableCell></TableRow>
                  )}
                  {c.sales.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell><Link href={`/admin/sales/${s.id}`} className="text-navy hover:underline">{s.saleCode}</Link></TableCell>
                      <TableCell className="text-xs text-muted-foreground">{s.project.nameBn ?? s.project.nameEn}</TableCell>
                      <TableCell>{s.plot.plotNumber}</TableCell>
                      <TableCell>{formatKatha(s.plot.sizeKatha.toString(), 'bn')}</TableCell>
                      <TableCell>{formatBDT(s.salePrice.toString())}</TableCell>
                      <TableCell><SaleStatusBadge status={s.status} /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle>লগইন অ্যাকাউন্ট</CardTitle></CardHeader>
            <CardContent>
              {c.user ? (
                <div className="space-y-1 text-sm">
                  <div className="flex items-center gap-2">
                    <Badge variant="success">সক্রিয়</Badge>
                    <span className="text-muted-foreground">পোর্টাল অ্যাক্সেস আছে</span>
                  </div>
                  <div className="font-mono text-xs text-ink">{c.user.email}</div>
                </div>
              ) : (
                <CreateLoginButton customerId={c.id} />
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>ডকুমেন্ট</CardTitle></CardHeader>
            <CardContent>
              <DocumentManager
                customerId={c.id}
                docs={c.documents.map((d) => ({ id: d.id, type: d.type, fileName: d.fileName, createdAt: d.createdAt.toISOString() }))}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function SummaryCard({ label, value, tone = 'default' }: { label: string; value: string; tone?: 'default' | 'green' | 'red' }) {
  const color = tone === 'green' ? 'text-green-700' : tone === 'red' ? 'text-red-700' : 'text-navy';
  return (
    <Card>
      <CardContent className="p-4">
        <div className="text-sm text-muted-foreground">{label}</div>
        <div className={`mt-1 text-2xl font-bold ${color}`}>{value}</div>
      </CardContent>
    </Card>
  );
}
