import Link from 'next/link';
import { requireCustomer } from '@/server/session';
import { logoutAction } from '@/server/actions/logout';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const user = await requireCustomer();

  return (
    <div className="min-h-screen bg-bg-soft">
      <header className="sticky top-0 z-10 border-b border-line bg-navy-deep text-white">
        <div className="container-content flex h-14 items-center justify-between">
          <Link href="/portal" className="flex items-center gap-2 font-display font-bold">
            <span className="flex size-7 items-center justify-center rounded bg-gold text-xs text-navy-deep">SD</span>
            <span>আমার পোর্টাল</span>
          </Link>
          <div className="flex items-center gap-3 text-sm">
            <span className="hidden text-white/70 sm:inline">{user.name}</span>
            <form action={logoutAction}>
              <Button type="submit" variant="ghost" size="sm" className="text-white hover:bg-white/10">
                <LogOut className="size-4" /> <span className="hidden sm:inline">লগআউট</span>
              </Button>
            </form>
          </div>
        </div>
      </header>
      <main className="container-content py-6">{children}</main>
    </div>
  );
}
