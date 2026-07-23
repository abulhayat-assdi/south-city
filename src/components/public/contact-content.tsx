import { Phone, Mail, MapPin } from 'lucide-react';
import { type Lang, T, tt, pick } from '@/lib/public-i18n';
import { SiteShell, type ShellCompany } from './site-shell';
import { EnquiryForm } from './enquiry-form';

export function ContactContent({ lang, company }: { lang: Lang; company: ShellCompany }) {
  return (
    <SiteShell lang={lang} company={company}>
      <section className="bg-navy-deep py-14 text-center text-white">
        <div className="container-content"><h1 className="font-display text-4xl font-bold text-white">{tt(lang, T.nav.contact)}</h1></div>
      </section>

      <section className="container-content grid gap-10 py-14 lg:grid-cols-2">
        <div className="space-y-4">
          <h2 className="font-display text-2xl font-bold text-navy">{pick(lang, company.nameEn, company.nameBn)}</h2>
          <ul className="space-y-3 text-ink/80">
            {company.phone && <li className="flex items-center gap-3"><Phone className="size-5 text-gold" /><a href={`tel:${company.phone}`} dir="ltr">{company.phone}</a></li>}
            {company.email && <li className="flex items-center gap-3"><Mail className="size-5 text-gold" /><a href={`mailto:${company.email}`}>{company.email}</a></li>}
            {(company.addressBn || company.addressEn) && <li className="flex items-start gap-3"><MapPin className="mt-0.5 size-5 shrink-0 text-gold" /><span>{pick(lang, company.addressEn, company.addressBn)}</span></li>}
          </ul>
        </div>
        <div className="rounded-xl border border-line bg-white p-6 shadow-card">
          <h3 className="mb-4 font-display text-lg font-semibold text-navy">{tt(lang, T.sections.enquiry)}</h3>
          <EnquiryForm lang={lang} />
        </div>
      </section>
    </SiteShell>
  );
}
