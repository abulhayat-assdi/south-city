import Link from 'next/link';
import type { Metadata } from 'next';
import { Prisma } from '@prisma/client';
import { requireStaff } from '@/server/session';
import { prisma } from '@/lib/db';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PageHeader } from '@/components/admin/page-header';
import { Plus } from 'lucide-react';

export const metadata: Metadata = { title: 'কাস্টমার' };

interface SearchParams {
  q?: string;
  size?: string;
  sector?: string;
  status?: string; // sale status
  pay?: string; // 'overdue'
}

export default async function CustomersPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  await requireStaff();
  const sp = await searchParams;

  const where: Prisma.CustomerWhereInput = {};
  if (sp.q) {
    where.OR = [
      { fullNameEn: { contains: sp.q, mode: 'insensitive' } },
      { fullNameBn: { contains: sp.q } },
      { phonePrimary: { contains: sp.q } },
      { nidNumber: { contains: sp.q } },
      { customerCode: { contains: sp.q, mode: 'insensitive' } },
    ];
  }
  const saleFilter: Prisma.SaleWhereInput = {};
  if (sp.status) saleFilter.status = sp.status as Prisma.SaleWhereInput['status'];
  if (sp.sector) saleFilter.plot = { sector: sp.sector };
  if (sp.size) saleFilter.plot = { ...(saleFilter.plot as object), sizeKatha: new Prisma.Decimal(sp.size) };
  if (sp.pay === 'overdue') saleFilter.installments = { some: { status: 'OVERDUE' } };
  if (Object.keys(saleFilter).length > 0) where.sales = { some: saleFilter };

  const customers = await prisma.customer.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: 200,
    include: {
      _count: { select: { sales: true } },
      user: { select: { id: true } },
    },
  });

  return (
    <div>
      <PageHeader
        title="কাস্টমার"
        subtitle={`${customers.length} জন`}
        action={
          <Button asChild>
            <Link href="/admin/customers/new"><Plus className="size-4" /> নতুন কাস্টমার</Link>
          </Button>
        }
      />

      <form className="mb-4 grid gap-3 rounded-lg border border-line bg-white p-4 sm:grid-cols-2 lg:grid-cols-6">
        <Input name="q" defaultValue={sp.q ?? ''} placeholder="নাম / ফোন / NID / কোড" className="lg:col-span-2" />
        <Select name="sector" defaultValue={sp.sector ?? ''}>
          <option value="">সব সেক্টর</option>
          {['A', 'B', 'C', 'D'].map((s) => <option key={s} value={s}>সেক্টর {s}</option>)}
        </Select>
        <Select name="size" defaultValue={sp.size ?? ''}>
          <option value="">সব সাইজ</option>
          {[3, 5, 10].map((s) => <option key={s} value={s}>{s} কাঠা</option>)}
        </Select>
        <Select name="pay" defaultValue={sp.pay ?? ''}>
          <option value="">পেমেন্ট: সব</option>
          <option value="overdue">শুধু মেয়াদোত্তীর্ণ</option>
        </Select>
        <div className="flex gap-2">
          <Button type="submit" className="flex-1">ফিল্টার</Button>
          <Button asChild variant="ghost"><Link href="/admin/customers">রিসেট</Link></Button>
        </div>
      </form>

      <div className="rounded-lg border border-line bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>কোড</TableHead>
              <TableHead>নাম</TableHead>
              <TableHead>ফোন</TableHead>
              <TableHead>প্লট</TableHead>
              <TableHead>লগইন</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customers.length === 0 && (
              <TableRow><TableCell colSpan={5} className="py-10 text-center text-muted-foreground">কোনো কাস্টমার পাওয়া যায়নি।</TableCell></TableRow>
            )}
            {customers.map((c) => (
              <TableRow key={c.id}>
                <TableCell className="font-mono text-xs">{c.customerCode}</TableCell>
                <TableCell>
                  <Link href={`/admin/customers/${c.id}`} className="font-medium text-navy hover:underline">
                    {c.fullNameEn}
                  </Link>
                  {c.fullNameBn && <div className="text-xs text-muted-foreground">{c.fullNameBn}</div>}
                </TableCell>
                <TableCell dir="ltr">{c.phonePrimary}</TableCell>
                <TableCell>{c._count.sales}</TableCell>
                <TableCell>
                  {c.user ? <Badge variant="success">আছে</Badge> : <Badge variant="secondary">নেই</Badge>}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
