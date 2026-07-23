import { type Lang, T, tt, pick } from '@/lib/public-i18n';
import { SiteShell, type ShellCompany } from './site-shell';

interface CoreValue { en: string; bn: string }

export interface AboutData extends ShellCompany {
  aboutEn: string | null; aboutBn: string | null;
  visionEn: string | null; visionBn: string | null;
  missionEn: string | null; missionBn: string | null;
  coreValues: unknown;
}

export function AboutContent({ lang, company }: { lang: Lang; company: AboutData }) {
  const values = Array.isArray(company.coreValues) ? (company.coreValues as CoreValue[]) : [];

  return (
    <SiteShell lang={lang} company={company}>
      <section className="bg-navy-deep py-14 text-center text-white">
        <div className="container-content">
          <h1 className="font-display text-4xl font-bold text-white">{tt(lang, T.nav.about)}</h1>
          <p className="mt-2 text-white/70">{pick(lang, company.nameEn, company.nameBn)}</p>
        </div>
      </section>

      <section className="container-content py-14">
        <p className="mx-auto max-w-3xl text-center text-ink/80">{pick(lang, company.aboutEn, company.aboutBn)}</p>
      </section>

      <section className="bg-bg-soft py-14">
        <div className="container-content grid gap-6 sm:grid-cols-2">
          <div className="rounded-xl border border-line bg-white p-6">
            <h3 className="mb-2 font-display text-xl font-bold text-navy">{tt(lang, T.sections.vision)}</h3>
            <p className="text-ink/80">{pick(lang, company.visionEn, company.visionBn)}</p>
          </div>
          <div className="rounded-xl border border-line bg-white p-6">
            <h3 className="mb-2 font-display text-xl font-bold text-navy">{tt(lang, T.sections.mission)}</h3>
            <p className="text-ink/80">{pick(lang, company.missionEn, company.missionBn)}</p>
          </div>
        </div>
      </section>

      {values.length > 0 && (
        <section className="container-content py-14">
          <div className="mb-8 text-center">
            <h2 className="font-display text-3xl font-bold text-navy">{tt(lang, T.sections.coreValues)}</h2>
            <div className="mx-auto mt-2 h-1 w-16 rounded bg-gold" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((v, i) => (
              <div key={i} className="rounded-xl border border-line bg-white p-6 text-center font-medium text-ink">{tt(lang, v)}</div>
            ))}
          </div>
        </section>
      )}
    </SiteShell>
  );
}
