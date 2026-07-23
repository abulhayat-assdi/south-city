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
import { SaleStatusBadge } from '@/components/admin/status-badge';
import { getActiveProjectId } from '@/server/projects';
import { Plus } from 'lucide-react';

export const metadata: Metadata = { title: 'বিক্রয়' };

interface SearchParams { project?: string; status?: string; type?: string; q?: string }

export default async function SalesPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  await requireStaff();
  const sp = await searchParams;
  const activeProject = await getActiveProjectId(sp.project);

  const where: Prisma.SaleWhereInput = {};
  if (activeProject) where.projectId = activeProject;
  if (sp.status) where.status = sp.status as Prisma.SaleWhereInput['status'];
  if (sp.type) where.paymentType = sp.type as Prisma.SaleWhereInput['paymentType'];
  if (sp.q) where.OR = [
    { saleCode: { contains: sp.q, mode: 'insensitive' } },
    { customer: { fullNameEn: { contains: sp.q, mode: 'insensitive' } } },
  ];

  const sales = await prisma.sale.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: 200,
    include: {
      project: { select: { nameEn: true, nameBn: true } },
      plot: { select: { plotNumber: true, sector: true } },
      customer: { select: { id: true, fullNameEn: true, customerCode: true } },
    },
  });

  return (
    <div>
      <PageHeader
        title="বিক্রয়"
        subtitle={`${sales.length} টি`}
        action={<Button asChild><Link href="/admin/sales/new"><Plus className="size-4" /> নতুন বিক্রয়</Link></Button>}
      />

      <form className="mb-4 grid gap-3 rounded-lg border border-line bg-white p-4 sm:grid-cols-2 lg:grid-cols-5">
        <Input name="q" defaultValue={sp.q ?? ''} placeholder="সেল কোড / কাস্টমার" className="lg:col-span-2" />
        <Select name="status" defaultValue={sp.status ?? ''}>
          <option value="">সব স্ট্যাটাস</option>
          <option value="ACTIVE">চলমান</option>
          <option value="COMPLETED">সম্পন্ন</option>
          <option value="CANCELLED">বাতিল</option>
        </Select>
        <Select name="type" defaultValue={sp.type ?? ''}>
          <option value="">সব ধরন</option>
          <option value="FULL">সম্পূর্ণ</option>
          <option value="INSTALLMENT">কিস্তি</option>
        </Select>
        <div className="flex gap-2">
          <Button type="submit" className="flex-1">ফিল্টার</Button>
          <Button asChild variant="ghost"><Link href="/admin/sales">রিসেট</Link></Button>
        </div>
      </form>

      <div className="rounded-lg border border-line bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>সেল কোড</TableHead>
              <TableHead>প্রজেক্ট</TableHead>
              <TableHead>প্লট</TableHead>
              <TableHead>কাস্টমার</TableHead>
              <TableHead>মূল্য</TableHead>
              <TableHead>ধরন</TableHead>
              <TableHead>স্ট্যাটাস</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sales.length === 0 && (
              <TableRow><TableCell colSpan={7} className="py-10 text-center text-muted-foreground">কোনো বিক্রয় নেই।</TableCell></TableRow>
            )}
            {sales.map((s) => (
              <TableRow key={s.id}>
                <TableCell><Link href={`/admin/sales/${s.id}`} className="font-medium text-navy hover:underline">{s.saleCode}</Link></TableCell>
                <TableCell className="text-xs text-muted-foreground">{s.project.nameBn ?? s.project.nameEn}</TableCell>
                <TableCell>{s.plot.plotNumber}</TableCell>
                <TableCell><Link href={`/admin/customers/${s.customer.id}`} className="hover:underline">{s.customer.fullNameEn}</Link></TableCell>
                <TableCell>{formatBDT(s.salePrice.toString())}</TableCell>
                <TableCell>{s.paymentType === 'FULL' ? 'সম্পূর্ণ' : 'কিস্তি'}</TableCell>
                <TableCell><SaleStatusBadge status={s.status} /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
