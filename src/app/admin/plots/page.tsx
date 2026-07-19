import Link from 'next/link';
import type { Metadata } from 'next';
import { Prisma } from '@prisma/client';
import { requireStaff } from '@/server/session';
import { prisma } from '@/lib/db';
import { formatBDT } from '@/lib/money';
import { formatKatha } from '@/lib/katha';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PageHeader } from '@/components/admin/page-header';
import { PlotStatusBadge } from '@/components/admin/status-badge';
import { Plus, Upload } from 'lucide-react';

export const metadata: Metadata = { title: 'প্লট ইনভেন্টরি' };

interface SearchParams {
  sector?: string;
  size?: string;
  category?: string;
  status?: string;
  q?: string;
}

export default async function PlotsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  await requireStaff();
  const sp = await searchParams;

  const where: Prisma.PlotWhereInput = {};
  if (sp.sector) where.sector = sp.sector;
  if (sp.size) where.sizeKatha = new Prisma.Decimal(sp.size);
  if (sp.category) where.category = sp.category as Prisma.PlotWhereInput['category'];
  if (sp.status) where.status = sp.status as Prisma.PlotWhereInput['status'];
  if (sp.q) where.plotNumber = { contains: sp.q, mode: 'insensitive' };

  const plots = await prisma.plot.findMany({
    where,
    orderBy: [{ sector: 'asc' }, { plotNumber: 'asc' }],
    take: 200,
  });

  return (
    <div>
      <PageHeader
        title="প্লট ইনভেন্টরি"
        subtitle={`${plots.length} টি প্লট`}
        action={
          <div className="flex gap-2">
            <Button asChild variant="outline">
              <Link href="/admin/plots/import"><Upload className="size-4" /> CSV ইমপোর্ট</Link>
            </Button>
            <Button asChild>
              <Link href="/admin/plots/new"><Plus className="size-4" /> নতুন প্লট</Link>
            </Button>
          </div>
        }
      />

      <form className="mb-4 grid gap-3 rounded-lg border border-line bg-white p-4 sm:grid-cols-2 lg:grid-cols-6">
        <Select name="sector" defaultValue={sp.sector ?? ''}>
          <option value="">সব সেক্টর</option>
          {['A', 'B', 'C', 'D'].map((s) => <option key={s} value={s}>সেক্টর {s}</option>)}
        </Select>
        <Select name="size" defaultValue={sp.size ?? ''}>
          <option value="">সব সাইজ</option>
          {[3, 5, 10].map((s) => <option key={s} value={s}>{s} কাঠা</option>)}
        </Select>
        <Select name="category" defaultValue={sp.category ?? ''}>
          <option value="">সব ক্যাটাগরি</option>
          <option value="RESIDENTIAL">আবাসিক</option>
          <option value="COMMERCIAL">বাণিজ্যিক</option>
        </Select>
        <Select name="status" defaultValue={sp.status ?? ''}>
          <option value="">সব স্ট্যাটাস</option>
          <option value="AVAILABLE">খালি</option>
          <option value="RESERVED">সংরক্ষিত</option>
          <option value="BOOKED">বুকড</option>
          <option value="SOLD">বিক্রীত</option>
        </Select>
        <Input name="q" defaultValue={sp.q ?? ''} placeholder="প্লট নম্বর খুঁজুন" />
        <div className="flex gap-2">
          <Button type="submit" className="flex-1">ফিল্টার</Button>
          <Button asChild variant="ghost"><Link href="/admin/plots">রিসেট</Link></Button>
        </div>
      </form>

      <div className="rounded-lg border border-line bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>প্লট</TableHead>
              <TableHead>সাইজ</TableHead>
              <TableHead>ক্যাটাগরি</TableHead>
              <TableHead>রাস্তা</TableHead>
              <TableHead>নির্দেশক মূল্য</TableHead>
              <TableHead>স্ট্যাটাস</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {plots.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                  কোনো প্লট পাওয়া যায়নি।
                </TableCell>
              </TableRow>
            )}
            {plots.map((p) => (
              <TableRow key={p.id}>
                <TableCell>
                  <Link href={`/admin/plots/${p.id}`} className="font-medium text-navy hover:underline">
                    {p.sector}-{p.plotNumber.replace(`${p.sector}-`, '')}
                  </Link>
                </TableCell>
                <TableCell>{formatKatha(p.sizeKatha.toString(), 'bn')}</TableCell>
                <TableCell>{p.category === 'RESIDENTIAL' ? 'আবাসিক' : 'বাণিজ্যিক'}</TableCell>
                <TableCell>{p.roadWidthFt ? `${p.roadWidthFt} ft` : '—'}</TableCell>
                <TableCell>{p.basePrice ? formatBDT(p.basePrice.toString()) : '—'}</TableCell>
                <TableCell><PlotStatusBadge status={p.status} /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
