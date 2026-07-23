import { type Lang } from '@/lib/public-i18n';
import { SiteHeader } from './site-header';
import { SiteFooter, type FooterCompany } from './site-footer';
import { WhatsAppFab } from './whatsapp-fab';

export interface ShellCompany extends FooterCompany {
  whatsapp: string | null;
}

/** Public marketing shell — header, footer, floating WhatsApp + sticky mobile bar.
 * Takes `lang` so a single component serves both bn ("/") and en ("/en"). */
export function SiteShell({
  lang,
  company,
  children,
}: {
  lang: Lang;
  company: ShellCompany;
  children: React.ReactNode;
}) {
  return (
    <div lang={lang} className="flex min-h-screen flex-col">
      <SiteHeader lang={lang} phone={company.phone} />
      <div className="flex-1 pb-16 sm:pb-0">{children}</div>
      <SiteFooter lang={lang} company={company} />
      <WhatsAppFab lang={lang} whatsapp={company.whatsapp} phone={company.phone} />
    </div>
  );
}
