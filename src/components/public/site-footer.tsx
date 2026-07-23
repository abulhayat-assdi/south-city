import Link from 'next/link';
import { Facebook, Youtube, Linkedin, Phone, Mail, MapPin } from 'lucide-react';
import { type Lang, T, tt, pick, localePath } from '@/lib/public-i18n';

export interface FooterCompany {
  nameEn: string;
  nameBn: string | null;
  taglinePrimary: string | null;
  phone: string | null;
  email: string | null;
  addressEn: string | null;
  addressBn: string | null;
  facebook: string | null;
  youtube: string | null;
  linkedin: string | null;
}

export function SiteFooter({ lang, company }: { lang: Lang; company: FooterCompany }) {
  const links = [
    { href: '/about', label: tt(lang, T.nav.about) },
    { href: '/projects', label: tt(lang, T.nav.projects) },
    { href: '/message/chairman', label: tt(lang, T.nav.chairman) },
    { href: '/message/md', label: tt(lang, T.nav.md) },
    { href: '/news', label: tt(lang, T.nav.news) },
    { href: '/contact', label: tt(lang, T.nav.contact) },
  ];

  return (
    <footer className="mt-16 bg-navy-deep text-white/80">
      <div className="container-content grid gap-8 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="mb-3 flex items-center gap-2">
            <span className="flex size-9 items-center justify-center rounded-md bg-gold text-sm font-bold text-navy-deep">SD</span>
            <span className="font-display font-bold text-white">{pick(lang, company.nameEn, company.nameBn)}</span>
          </div>
          <p className="text-sm">{company.taglinePrimary}</p>
        </div>

        <div>
          <h4 className="mb-3 font-display font-semibold text-white">{tt(lang, T.nav.projects)}</h4>
          <ul className="space-y-2 text-sm">
            {links.map((l) => (
              <li key={l.href}><Link href={localePath(lang, l.href)} className="hover:text-gold">{l.label}</Link></li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="mb-3 font-display font-semibold text-white">{tt(lang, T.nav.contact)}</h4>
          <ul className="space-y-2 text-sm">
            {company.phone && <li className="flex items-center gap-2"><Phone className="size-4 text-gold" /><a href={`tel:${company.phone}`} dir="ltr">{company.phone}</a></li>}
            {company.email && <li className="flex items-center gap-2"><Mail className="size-4 text-gold" /><a href={`mailto:${company.email}`}>{company.email}</a></li>}
            {(company.addressBn || company.addressEn) && (
              <li className="flex items-start gap-2"><MapPin className="mt-0.5 size-4 shrink-0 text-gold" /><span>{pick(lang, company.addressEn, company.addressBn)}</span></li>
            )}
          </ul>
        </div>

        <div>
          <h4 className="mb-3 font-display font-semibold text-white">Follow</h4>
          <div className="flex gap-3">
            {company.facebook && <a href={company.facebook} target="_blank" rel="noreferrer" className="hover:text-gold"><Facebook className="size-5" /></a>}
            {company.youtube && <a href={company.youtube} target="_blank" rel="noreferrer" className="hover:text-gold"><Youtube className="size-5" /></a>}
            {company.linkedin && <a href={company.linkedin} target="_blank" rel="noreferrer" className="hover:text-gold"><Linkedin className="size-5" /></a>}
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-xs text-white/50">
        © 2026 {company.nameEn}. All rights reserved.
      </div>
    </footer>
  );
}
