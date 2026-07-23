import Image from 'next/image';
import { Download, MapPin, Check } from 'lucide-react';
import { type Lang, T, tt, pick } from '@/lib/public-i18n';
import { Button } from '@/components/ui/button';
import { SiteShell, type ShellCompany } from './site-shell';
import { EnquiryForm } from './enquiry-form';
import { waLink } from './whatsapp-fab';

// JSON shapes (see prisma/seed.ts).
interface Amenity { icon?: string; en: string; bn: string }
interface Trust { icon?: string; en: string; bn: string }
interface LandmarkItem { nameEn: string; nameBn: string; noteEn: string; noteBn: string }
interface Landmark { id: string; labelEn: string; labelBn: string; image?: string; items: LandmarkItem[] }
interface Distance { placeEn: string; placeBn: string; valueEn: string; valueBn: string }
interface Boundary { sideEn: string; sideBn: string; valueEn: string; valueBn: string }
interface PlotType { katha: number; sqftEn: string; sqftBn: string; dimEn: string; dimBn: string; price: string | null }

export interface ProjectData {
  slug: string;
  nameEn: string; nameBn: string | null;
  tagline: string | null;
  logoUrl: string | null; heroImageUrl: string | null; masterPlanUrl: string | null;
  locationEn: string | null; locationBn: string | null;
  sizeText: string | null; sectorsText: string | null; plotSizesText: string | null; roadWidthText: string | null;
  descriptionEn: string | null; descriptionBn: string | null;
  mapEmbedUrl: string | null; brochureUrl: string | null;
  amenities: unknown; landmarks: unknown; distances: unknown; boundaries: unknown; plotTypes: unknown; trustItems: unknown;
  gallery: { url: string; captionEn: string | null; captionBn: string | null }[];
}

const arr = <T,>(v: unknown): T[] => (Array.isArray(v) ? (v as T[]) : []);

export function ProjectDetailContent({ lang, company, project }: { lang: Lang; company: ShellCompany; project: ProjectData }) {
  const amenities = arr<Amenity>(project.amenities);
  const trust = arr<Trust>(project.trustItems);
  const landmarks = arr<Landmark>(project.landmarks);
  const distances = arr<Distance>(project.distances);
  const boundaries = arr<Boundary>(project.boundaries);
  const plotTypes = arr<PlotType>(project.plotTypes);
  const name = pick(lang, project.nameEn, project.nameBn);

  const glance: [string, string | null][] = [
    [lang === 'bn' ? 'আয়তন' : 'Size', project.sizeText],
    [lang === 'bn' ? 'সেক্টর' : 'Sectors', project.sectorsText],
    [lang === 'bn' ? 'প্লট সাইজ' : 'Plot sizes', project.plotSizesText],
    [lang === 'bn' ? 'রাস্তা' : 'Road width', project.roadWidthText],
  ];

  return (
    <SiteShell lang={lang} company={company}>
      {/* hero */}
      <section className="relative flex min-h-[420px] items-end overflow-hidden bg-navy-deep text-white">
        {project.heroImageUrl && (
          <Image src={project.heroImageUrl} alt={name} fill priority className="object-cover opacity-40" sizes="100vw" />
        )}
        <div className="container-content relative py-14">
          <h1 className="font-display text-4xl font-bold text-white sm:text-5xl">{name}</h1>
          {project.tagline && <p className="mt-3 max-w-xl text-lg text-white/80">{project.tagline}</p>}
          <div className="mt-3 flex items-center gap-2 text-white/70"><MapPin className="size-4 text-gold" />{pick(lang, project.locationEn, project.locationBn)}</div>
          <div className="mt-6 flex flex-wrap gap-3">
            {company.whatsapp && (
              <Button asChild className="bg-whatsapp hover:bg-whatsapp/90">
                <a href={waLink(company.whatsapp, `${name} — ${lang === 'bn' ? 'প্লটের তথ্য চাই' : 'plot details please'}`)} target="_blank" rel="noreferrer">WhatsApp</a>
              </Button>
            )}
            <Button asChild variant="gold"><a href="#enquiry">{tt(lang, T.cta.getDetails)}</a></Button>
          </div>
        </div>
      </section>

      {/* overview */}
      {(project.descriptionBn || project.descriptionEn) && (
        <section className="container-content py-14">
          <Head lang={lang} title={tt(lang, T.sections.overview)} />
          <p className="mx-auto max-w-3xl text-center text-ink/80">{pick(lang, project.descriptionEn, project.descriptionBn)}</p>
        </section>
      )}

      {/* trust row */}
      {trust.length > 0 && (
        <section className="bg-bg-soft py-10">
          <div className="container-content grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {trust.map((t, i) => (
              <div key={i} className="flex items-center gap-3 rounded-lg border border-line bg-white p-4">
                <Check className="size-5 shrink-0 text-gold" />
                <span className="text-sm font-medium text-ink">{tt(lang, t)}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* at a glance + brochure */}
      <section className="container-content py-14">
        <Head lang={lang} title={tt(lang, T.sections.atGlance)} />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {glance.map(([k, v]) => (
            <div key={k} className="rounded-xl border border-line bg-white p-5 text-center">
              <div className="text-sm text-muted-foreground">{k}</div>
              <div className="mt-1 font-display text-lg font-bold text-navy">{v ?? '—'}</div>
            </div>
          ))}
        </div>
        {project.brochureUrl && (
          <div className="mt-6 text-center">
            <Button asChild variant="outline"><a href={project.brochureUrl} target="_blank" rel="noreferrer"><Download className="size-4" /> {tt(lang, T.cta.brochure)}</a></Button>
          </div>
        )}
      </section>

      {/* master plan */}
      {project.masterPlanUrl && (
        <section className="bg-bg-soft py-14">
          <div className="container-content">
            <Head lang={lang} title={tt(lang, T.sections.masterPlan)} />
            <div className="relative mx-auto aspect-[4/3] max-w-4xl overflow-hidden rounded-xl border border-line bg-white">
              <Image src={project.masterPlanUrl} alt="master plan" fill className="object-contain" sizes="900px" />
            </div>
          </div>
        </section>
      )}

      {/* plot sizes */}
      {plotTypes.length > 0 && (
        <section className="container-content py-14">
          <Head lang={lang} title={tt(lang, T.sections.plotSizes)} />
          <div className="grid gap-6 sm:grid-cols-3">
            {plotTypes.map((p) => (
              <div key={p.katha} className="rounded-xl border border-line bg-white p-6 text-center shadow-card">
                <div className="font-display text-3xl font-bold text-navy">{p.katha} <span className="text-lg">{lang === 'bn' ? 'কাঠা' : 'Katha'}</span></div>
                <div className="mt-2 text-sm text-muted-foreground">{lang === 'bn' ? p.sqftBn : p.sqftEn}</div>
                <div className="text-sm text-muted-foreground">{lang === 'bn' ? p.dimBn : p.dimEn}</div>
                <div className="mt-3 font-semibold text-gold">{p.price ?? tt(lang, T.callForPrice)}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* location */}
      {(project.mapEmbedUrl || distances.length > 0 || boundaries.length > 0) && (
        <section className="bg-bg-soft py-14">
          <div className="container-content">
            <Head lang={lang} title={tt(lang, T.sections.location)} />
            <div className="grid gap-6 lg:grid-cols-2">
              {project.mapEmbedUrl && (
                <div className="overflow-hidden rounded-xl border border-line">
                  <iframe src={project.mapEmbedUrl} loading="lazy" className="h-72 w-full" title="map" referrerPolicy="no-referrer-when-downgrade" />
                </div>
              )}
              <div className="space-y-6">
                {distances.length > 0 && (
                  <div className="rounded-xl border border-line bg-white p-5">
                    <h4 className="mb-3 font-display font-semibold text-navy">{lang === 'bn' ? 'দূরত্ব' : 'Distances'}</h4>
                    <dl className="divide-y divide-line text-sm">
                      {distances.map((d, i) => (
                        <div key={i} className="flex justify-between py-2"><dt className="text-muted-foreground">{lang === 'bn' ? d.placeBn : d.placeEn}</dt><dd className="font-medium">{lang === 'bn' ? d.valueBn : d.valueEn}</dd></div>
                      ))}
                    </dl>
                  </div>
                )}
                {boundaries.length > 0 && (
                  <div className="rounded-xl border border-line bg-white p-5">
                    <h4 className="mb-3 font-display font-semibold text-navy">{lang === 'bn' ? 'সীমানা' : 'Boundaries'}</h4>
                    <dl className="divide-y divide-line text-sm">
                      {boundaries.map((b, i) => (
                        <div key={i} className="flex justify-between py-2"><dt className="text-muted-foreground">{lang === 'bn' ? b.sideBn : b.sideEn}</dt><dd className="font-medium">{lang === 'bn' ? b.valueBn : b.valueEn}</dd></div>
                      ))}
                    </dl>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* landmarks */}
      {landmarks.length > 0 && (
        <section className="container-content py-14">
          <Head lang={lang} title={tt(lang, T.sections.landmarks)} />
          <div className="grid gap-6 sm:grid-cols-2">
            {landmarks.map((g) => (
              <div key={g.id} className="rounded-xl border border-line bg-white p-5">
                <h4 className="mb-3 font-display font-semibold text-navy">{lang === 'bn' ? g.labelBn : g.labelEn}</h4>
                <ul className="space-y-2 text-sm">
                  {g.items.map((it, i) => (
                    <li key={i} className="flex justify-between gap-3">
                      <span>{lang === 'bn' ? it.nameBn : it.nameEn}</span>
                      <span className="text-muted-foreground">{lang === 'bn' ? it.noteBn : it.noteEn}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* amenities */}
      {amenities.length > 0 && (
        <section className="bg-bg-soft py-14">
          <div className="container-content">
            <Head lang={lang} title={tt(lang, T.sections.amenities)} />
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {amenities.map((a, i) => (
                <div key={i} className="flex items-center gap-2 rounded-lg border border-line bg-white p-4 text-sm font-medium text-ink">
                  <Check className="size-4 shrink-0 text-gold" /> {tt(lang, a)}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* gallery */}
      {project.gallery.length > 0 && (
        <section className="container-content py-14">
          <Head lang={lang} title={tt(lang, T.sections.gallery)} />
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {project.gallery.map((g, i) => (
              <div key={i} className="relative aspect-video overflow-hidden rounded-lg border border-line bg-bg-soft">
                <Image src={g.url} alt={pick(lang, g.captionEn, g.captionBn)} fill className="object-cover" sizes="400px" />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* enquiry */}
      <section id="enquiry" className="bg-navy py-14 text-white">
        <div className="container-content max-w-2xl">
          <h2 className="mb-6 text-center font-display text-2xl font-bold text-white">{tt(lang, T.sections.enquiry)}</h2>
          <div className="rounded-xl bg-white p-6">
            <EnquiryForm lang={lang} projectSlug={project.slug} />
          </div>
        </div>
      </section>
    </SiteShell>
  );
}

function Head({ lang, title }: { lang: Lang; title: string }) {
  void lang;
  return (
    <div className="mb-8 text-center">
      <h2 className="font-display text-3xl font-bold text-navy">{title}</h2>
      <div className="mx-auto mt-2 h-1 w-16 rounded bg-gold" />
    </div>
  );
}
