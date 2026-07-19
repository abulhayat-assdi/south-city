import type { Metadata } from 'next';
import { requireStaff } from '@/server/session';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const metadata: Metadata = { title: 'ড্যাশবোর্ড' };

// Placeholder dashboard — real KPI cards, charts and the recent-payments feed
// (spec §6.1) are wired up in the Reports step once the modules exist.
export default async function AdminDashboardPage() {
  const user = await requireStaff();

  const kpis = [
    { label: 'মোট প্লট', value: '—' },
    { label: 'এই মাসে বিক্রয়', value: '—' },
    { label: 'এই মাসে কালেকশন (৳)', value: '—' },
    { label: 'মোট বকেয়া (৳)', value: '—' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">স্বাগতম, {user.name} 👋</h1>
        <p className="text-sm text-muted-foreground">
          South City ERP ড্যাশবোর্ড। মডিউলগুলো ধাপে ধাপে যুক্ত হচ্ছে।
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((kpi) => (
          <Card key={kpi.label}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{kpi.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-navy">{kpi.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
