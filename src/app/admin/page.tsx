import Link from 'next/link';
import type { Metadata } from 'next';
import { requireStaff } from '@/server/session';
import { getActiveProjectId } from '@/server/projects';
import { dashboardKpis } from '@/server/services/reports';
import { formatBDT, toDecimalString } from '@/lib/money';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export const metadata: Metadata = { title: 'ড্যাশবোর্ড' };

const dmy = (d: Date) => d.toLocaleDateString('en-GB');

export default async function AdminDashboardPage() {
  const user = await requireStaff();
  const scope = await getActiveProjectId();
  const k = await dashboardKpis(scope);

  const kpis = [
    { label: 'মোট প্লট', value: String(k.totalPlots), href: '/admin/plots' },
    { label: 'এই মাসে বিক্রয়', value: String(k.soldThisMonth), href: '/admin/sales' },
    { label: 'এই মাসে কালেকশন', value: formatBDT(toDecimalString(k.collectionThisMonth)), href: '/admin/payments' },
    { label: 'মোট বকেয়া', value: formatBDT(toDecimalString(k.outstanding)), href: '/admin/reports/dues' },
  ];

  const statusRows: { label: string; key: string; tone: string }[] = [
    { label: 'খালি', key: 'AVAILABLE', tone: 'text-green-700' },
    { label: 'সংরক্ষিত', key: 'RESERVED', tone: 'text-amber-600' },
    { label: 'বুকড', key: 'BOOKED', tone: 'text-gold' },
    { label: 'বিক্রীত', key: 'SOLD', tone: 'text-navy' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">স্বাগতম, {user.name} 👋</h1>
        <p className="text-sm text-muted-foreground">
          {scope ? 'নির্বাচিত প্রজেক্টের' : 'সব প্রজেক্টের'} সারসংক্ষেপ। উপরের সুইচার দিয়ে প্রজেক্ট বদলান।
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((kpi) => (
          <Link key={kpi.label} href={kpi.href}>
            <Card className="transition-shadow hover:shadow-header">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{kpi.label}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-navy">{kpi.value}</div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader><CardTitle>প্লট স্ট্যাটাস</CardTitle></CardHeader>
          <CardContent>
            <dl className="space-y-2">
              {statusRows.map((r) => (
                <div key={r.key} className="flex items-center justify-between text-sm">
                  <dt className="text-muted-foreground">{r.label}</dt>
                  <dd className={`text-lg font-bold ${r.tone}`}>{k.statusCounts[r.key] ?? 0}</dd>
                </div>
              ))}
              <div className="flex items-center justify-between border-t border-line pt-2 text-sm">
                <dt className="text-red-700">মেয়াদোত্তীর্ণ কিস্তি</dt>
                <dd className="text-lg font-bold text-red-700">{k.overdueCount}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>সাম্প্রতিক পেমেন্ট</CardTitle></CardHeader>
          <CardContent className="px-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>রশিদ</TableHead><TableHead>তারিখ</TableHead>
                  <TableHead>কাস্টমার</TableHead><TableHead>অঙ্ক</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {k.recentPayments.length === 0 && (
                  <TableRow><TableCell colSpan={4} className="py-6 text-center text-muted-foreground">এখনো কোনো পেমেন্ট নেই।</TableCell></TableRow>
                )}
                {k.recentPayments.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-mono text-xs">
                      <Link href={`/admin/sales/${p.sale.id}`} className="text-navy hover:underline">{p.receiptNo}</Link>
                    </TableCell>
                    <TableCell>{dmy(p.paymentDate)}</TableCell>
                    <TableCell>{p.sale.customer.fullNameEn}</TableCell>
                    <TableCell>{formatBDT(p.amount.toString())}</TableCell>
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
