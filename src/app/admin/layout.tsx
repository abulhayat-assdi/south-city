import Link from 'next/link';
import { requireStaff } from '@/server/session';
import { Sidebar } from '@/components/admin/sidebar';
import { Topbar } from '@/components/admin/topbar';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireStaff();

  return (
    <div className="flex min-h-screen bg-bg-soft">
      <aside className="hidden w-60 shrink-0 flex-col bg-navy-deep md:flex">
        <Link href="/admin" className="flex h-14 items-center px-4 font-display text-lg font-bold text-white">
          South City
        </Link>
        <Sidebar role={user.role} />
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar name={user.name} role={user.role} />
        <main className="flex-1 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
