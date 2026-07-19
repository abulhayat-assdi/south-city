'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { Role } from '@prisma/client';
import { cn } from '@/lib/utils';
import { visibleNav } from './nav-items';

export function Sidebar({ role }: { role: Role }) {
  const pathname = usePathname();
  const items = visibleNav(role);

  return (
    <nav className="flex flex-col gap-1 p-3">
      {items.map((item) => {
        const active = item.href === '/admin' ? pathname === '/admin' : pathname.startsWith(item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
              active ? 'bg-gold/15 text-navy' : 'text-white/70 hover:bg-white/10 hover:text-white',
            )}
          >
            <Icon className="size-4 shrink-0" />
            <span className="flex flex-col leading-tight">
              <span>{item.labelBn}</span>
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
