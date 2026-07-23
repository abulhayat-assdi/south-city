import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, ShieldCheck, FileText, CalendarClock, MapPin } from 'lucide-react';
import { type Lang, T, tt, pick, localePath } from '@/lib/public-i18n';
import { Button } from '@/components/ui/button';
import { SiteShell, type ShellCompany } from './site-shell';
import { waLink } from './whatsapp-fab';

interface ProjectCard {
  slug: string;
  nameEn: string; nameBn: string | null;
  locationEn: string | null; locationBn: string | null;
  sizeText: string | null; plotSizesText: string | null;
  heroImageUrl: string | null; logoUrl: string | null;
}
interface NewsCard { slug: string; titleEn: string; titleBn: string | null; publishedAt: Date | null; coverUrl: string | null }

export function HomeContent({
  lang, company, projects, news,
}: {
  lang: Lang; company: ShellCompany & { taglineSecondary: string | null }; projects: ProjectCard[]; news: NewsCard[];
}) {
  const why = [
    { icon: ShieldCheck, en: 'Legally secure land', bn: 'আইনগতভাবে নিরাপদ জমি' },
    { icon: FileText, en: 'Transparent documentation', bn: 'স্বচ্ছ ডকুমেন্টেশন' },
    { icon: CalendarClock, en: 'Installments up to 5 years', bn: '৫ বছর পর্যন্ত কিস্তি' },
    { icon: MapPin, en: 'Prime, connected locations', bn: 'প্রাইম, সংযুক্ত লোকেশন' },
  ];

  return (
    <SiteShell lang={lang} company={company}>
      {/* hero */}
      <section className="relative overflow-hidden bg-navy-deep text-white">
        <div className="container-content grid items-center gap-8 py-16 sm:py-24 lg:grid-cols-2">
          <div>
            <p className="mb-3 text-sm uppercase tracking-widest text-gold">{pick(lang, company.nameEn, company.nameBn)}</p>
            <h1 className="font-display text-4xl font-bold leading-tight text-white sm:text-5xl">
              {company.taglinePrimary}
            </h1>
            <p className="mt-4 max-w-md text-white/70">{company.taglineSecondary}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild variant="gold" size="lg"><Link href={localePath(lang, '/projects')}>{tt(lang, T.sections.ourProjects)} <ArrowRight className="size-4" /></Link></Button>
              {company.whatsapp && (
                <Button asChild size="lg" className="bg-whatsapp hover:bg-whatsapp/90">
                  <a href={waLink(company.whatsapp, lang === 'bn' ? 'আসসালামু আলাইকুম' : 'Hello')} target="_blank" rel="noreferrer">WhatsApp</a>
                </Button>
              )}
            </div>
          </div>
          {projects[0]?.heroImageUrl && (
            <div className="relative hidden h-80 overflow-hidden rounded-xl lg:block">
              <Image src={projects[0].heroImageUrl} alt="" fill priority className="object-cover" sizes="600px" />
            </div>
          )}
        </div>
      </section>

      {/* projects grid */}
      <section className="container-content py-16">
        <SectionHead lang={lang} title={tt(lang, T.sections.ourProjects)} />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((p) => (
            <Link key={p.slug} href={localePath(lang, `/projects/${p.slug}`)} className="group overflow-hidden rounded-xl border border-line bg-white shadow-card transition-shadow hover:shadow-header">
              <div className="relative aspect-video bg-bg-soft">
                {p.heroImageUrl && <Image src={p.heroImageUrl} alt="" fill className="object-cover transition-transform group-hover:scale-105" sizes="400px" />}
              </div>
              <div className="p-5">
                <h3 className="font-display text-lg font-semibold text-navy">{pick(lang, p.nameEn, p.nameBn)}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{pick(lang, p.locationEn, p.locationBn)}</p>
                <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
                  {p.sizeText && <span className="rounded bg-bg-soft px-2 py-1">{p.sizeText}</span>}
                  {p.plotSizesText && <span className="rounded bg-bg-soft px-2 py-1">{p.plotSizesText}</span>}
                </div>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-gold">{tt(lang, T.cta.viewProject)} <ArrowRight className="size-4" /></span>
              </div>
            </Link>
          ))}
          {projects.length === 0 && <p className="text-muted-foreground">{lang === 'bn' ? 'শীঘ্রই আসছে।' : 'Coming soon.'}</p>}
        </div>
      </section>

      {/* why us */}
      <section className="bg-bg-soft py-16">
        <div className="container-content">
          <SectionHead lang={lang} title={tt(lang, T.sections.whyUs)} />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {why.map((w) => (
              <div key={w.en} className="rounded-xl border border-line bg-white p-6 text-center">
                <w.icon className="mx-auto mb-3 size-8 text-gold" />
                <p className="text-sm font-medium text-ink">{tt(lang, w)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* news */}
      {news.length > 0 && (
        <section className="container-content py-16">
          <SectionHead lang={lang} title={tt(lang, T.sections.latestNews)} />
          <div className="grid gap-6 sm:grid-cols-3">
            {news.slice(0, 3).map((n) => (
              <Link key={n.slug} href={localePath(lang, `/news/${n.slug}`)} className="rounded-xl border border-line bg-white p-5 hover:shadow-card">
                <h3 className="font-display font-semibold text-navy">{pick(lang, n.titleEn, n.titleBn)}</h3>
                {n.publishedAt && <p className="mt-2 text-xs text-muted-foreground">{n.publishedAt.toLocaleDateString('en-GB')}</p>}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="bg-navy py-14 text-center text-white">
        <div className="container-content">
          <h2 className="font-display text-2xl font-bold text-white">{lang === 'bn' ? 'আপনার স্বপ্নের প্লট খুঁজছেন?' : 'Looking for your dream plot?'}</h2>
          <p className="mt-2 text-white/70">{lang === 'bn' ? 'আজই আমাদের সাথে যোগাযোগ করুন।' : 'Get in touch with us today.'}</p>
          <Button asChild variant="gold" size="lg" className="mt-6"><Link href={localePath(lang, '/contact')}>{tt(lang, T.nav.contact)}</Link></Button>
        </div>
      </section>
    </SiteShell>
  );
}

function SectionHead({ lang, title }: { lang: Lang; title: string }) {
  return (
    <div className="mb-8 text-center">
      <h2 className="font-display text-3xl font-bold text-navy">{title}</h2>
      <div className="mx-auto mt-2 h-1 w-16 rounded bg-gold" />
    </div>
  );
}
