import Image from 'next/image';
import { type Lang, pick } from '@/lib/public-i18n';
import { SiteShell, type ShellCompany } from './site-shell';

export interface LeaderData {
  personName: string;
  titleEn: string | null; titleBn: string | null;
  photoUrl: string | null;
  messageEn: string | null; messageBn: string | null;
}

export function LeaderContent({ lang, company, leader }: { lang: Lang; company: ShellCompany; leader: LeaderData }) {
  return (
    <SiteShell lang={lang} company={company}>
      <section className="bg-navy-deep py-14 text-center text-white">
        <div className="container-content">
          <h1 className="font-display text-3xl font-bold text-white">{pick(lang, leader.titleEn, leader.titleBn)}</h1>
        </div>
      </section>
      <section className="container-content py-14">
        <div className="mx-auto grid max-w-4xl gap-8 md:grid-cols-3">
          <div className="text-center">
            <div className="relative mx-auto aspect-[3/4] w-48 overflow-hidden rounded-xl border border-line bg-bg-soft">
              {leader.photoUrl && <Image src={leader.photoUrl} alt={leader.personName} fill className="object-cover" sizes="200px" />}
            </div>
            <div className="mt-3 font-display font-bold text-navy">{leader.personName}</div>
            <div className="text-sm text-muted-foreground">{pick(lang, leader.titleEn, leader.titleBn)}</div>
          </div>
          <div className="md:col-span-2">
            <p className="whitespace-pre-line text-ink/80">{pick(lang, leader.messageEn, leader.messageBn)}</p>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
