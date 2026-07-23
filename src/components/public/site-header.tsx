import Link from 'next/link';
import { Phone } from 'lucide-react';
import { type Lang, T, tt, localePath } from '@/lib/public-i18n';
import { Button } from '@/components/ui/button';

export function SiteHeader({ lang, phone }: { lang: Lang; phone?: string | null }) {
  const nav = [
    { href: '/', label: tt(lang, T.nav.home) },
    { href: '/about', label: tt(lang, T.nav.about) },
    { href: '/projects', label: tt(lang, T.nav.projects) },
    { href: '/news', label: tt(lang, T.nav.news) },
    { href: '/contact', label: tt(lang, T.nav.contact) },
  ];
  const other = lang === 'bn' ? { href: '/en', label: 'EN' } : { href: '/', label: 'বাংলা' };

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-white/95 shadow-header backdrop-blur">
      <div className="container-content flex h-16 items-center justify-between gap-4">
        <Link href={localePath(lang, '/')} className="flex items-center gap-2">
          <span className="flex size-9 items-center justify-center rounded-md bg-navy text-sm font-bold text-white">SD</span>
          <span className="hidden leading-tight sm:block">
            <span className="block font-display text-sm font-bold text-navy">South Dhaka</span>
            <span className="block text-[10px] uppercase tracking-wider text-muted-foreground">Properties &amp; Housing Ltd.</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {nav.map((n) => (
            <Link key={n.href} href={localePath(lang, n.href)} className="rounded-md px-3 py-2 text-sm font-medium text-ink hover:bg-bg-soft hover:text-navy">
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link href={other.href} className="rounded-md border border-line px-2 py-1 text-xs font-medium text-ink hover:bg-bg-soft">
            {other.label}
          </Link>
          {phone && (
            <Button asChild variant="gold" size="sm" className="hidden sm:inline-flex">
              <a href={`tel:${phone}`}><Phone className="size-4" /> {tt(lang, T.cta.call)}</a>
            </Button>
          )}
        </div>
      </div>

      {/* mobile nav */}
      <nav className="flex items-center gap-1 overflow-x-auto border-t border-line px-3 py-2 md:hidden">
        {nav.map((n) => (
          <Link key={n.href} href={localePath(lang, n.href)} className="whitespace-nowrap rounded-md px-3 py-1.5 text-sm text-ink hover:bg-bg-soft">
            {n.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
