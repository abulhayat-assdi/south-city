import Link from 'next/link';
import type { Metadata } from 'next';
import { requireStaff } from '@/server/session';
import { Card, CardContent } from '@/components/ui/card';
import { PageHeader } from '@/components/admin/page-header';
import { FileText, AlertTriangle, Wallet, Boxes } from 'lucide-react';

export const metadata: Metadata = { title: 'রিপোর্ট' };

const reports = [
  { href: '/admin/reports/sales', icon: FileText, title: 'কে কী কিনেছে', desc: 'বিক্রয় তালিকা — প্রজেক্ট, সাইজ, সেক্টর, তারিখ, ধরন অনুযায়ী।' },
  { href: '/admin/reports/dues', icon: Wallet, title: 'বকেয়া রিপোর্ট', desc: 'প্রতিটি বিক্রয়ের মোট মূল্য, পরিশোধিত ও বকেয়া।' },
  { href: '/admin/reports/overdue', icon: AlertTriangle, title: 'মেয়াদোত্তীর্ণ কিস্তি', desc: 'ফলো-আপের জন্য বকেয়া কিস্তির তালিকা।' },
  { href: '/admin/reports/inventory', icon: Boxes, title: 'ইনভেন্টরি রিপোর্ট', desc: 'স্ট্যাটাস ও সাইজ অনুযায়ী প্লট।' },
];

export default async function ReportsPage() {
  await requireStaff();
  return (
    <div>
      <PageHeader title="রিপোর্ট" subtitle="সব রিপোর্ট প্রজেক্ট অনুযায়ী স্কোপড এবং CSV-তে এক্সপোর্টযোগ্য।" />
      <div className="grid gap-4 sm:grid-cols-2">
        {reports.map((r) => (
          <Link key={r.href} href={r.href}>
            <Card className="h-full transition-shadow hover:shadow-header">
              <CardContent className="flex items-start gap-4 p-5">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-navy/5 text-navy">
                  <r.icon className="size-5" />
                </span>
                <div>
                  <div className="font-display font-semibold text-navy">{r.title}</div>
                  <p className="mt-0.5 text-sm text-muted-foreground">{r.desc}</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
