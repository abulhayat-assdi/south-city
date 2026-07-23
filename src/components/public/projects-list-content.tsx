import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, MapPin } from 'lucide-react';
import { type Lang, T, tt, pick, localePath } from '@/lib/public-i18n';
import { SiteShell, type ShellCompany } from './site-shell';

interface ProjectCard {
  slug: string;
  nameEn: string; nameBn: string | null;
  locationEn: string | null; locationBn: string | null;
  sizeText: string | null; plotSizesText: string | null; sectorsText: string | null;
  heroImageUrl: string | null;
}

export function ProjectsListContent({ lang, company, projects }: { lang: Lang; company: ShellCompany; projects: ProjectCard[] }) {
  return (
    <SiteShell lang={lang} company={company}>
      <section className="bg-navy-deep py-14 text-center text-white">
        <div className="container-content">
          <h1 className="font-display text-4xl font-bold text-white">{tt(lang, T.sections.ourProjects)}</h1>
        </div>
      </section>

      <section className="container-content py-14">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((p) => (
            <Link key={p.slug} href={localePath(lang, `/projects/${p.slug}`)} className="group overflow-hidden rounded-xl border border-line bg-white shadow-card transition-shadow hover:shadow-header">
              <div className="relative aspect-video bg-bg-soft">
                {p.heroImageUrl && <Image src={p.heroImageUrl} alt="" fill className="object-cover transition-transform group-hover:scale-105" sizes="400px" />}
              </div>
              <div className="p-5">
                <h3 className="font-display text-lg font-semibold text-navy">{pick(lang, p.nameEn, p.nameBn)}</h3>
                <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground"><MapPin className="size-3.5" />{pick(lang, p.locationEn, p.locationBn)}</p>
                <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
                  {p.sizeText && <span className="rounded bg-bg-soft px-2 py-1">{p.sizeText}</span>}
                  {p.sectorsText && <span className="rounded bg-bg-soft px-2 py-1">{p.sectorsText}</span>}
                  {p.plotSizesText && <span className="rounded bg-bg-soft px-2 py-1">{p.plotSizesText}</span>}
                </div>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-gold">{tt(lang, T.cta.viewProject)} <ArrowRight className="size-4" /></span>
              </div>
            </Link>
          ))}
          {projects.length === 0 && <p className="text-muted-foreground">{lang === 'bn' ? 'শীঘ্রই আসছে।' : 'Coming soon.'}</p>}
        </div>
      </section>
    </SiteShell>
  );
}
