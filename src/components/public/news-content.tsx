import Link from 'next/link';
import Image from 'next/image';
import { type Lang, T, tt, pick, localePath } from '@/lib/public-i18n';
import { SiteShell, type ShellCompany } from './site-shell';

interface NewsCard { slug: string; titleEn: string; titleBn: string | null; publishedAt: Date | null; coverUrl: string | null }

export function NewsListContent({ lang, company, posts }: { lang: Lang; company: ShellCompany; posts: NewsCard[] }) {
  return (
    <SiteShell lang={lang} company={company}>
      <section className="bg-navy-deep py-14 text-center text-white">
        <div className="container-content"><h1 className="font-display text-4xl font-bold text-white">{tt(lang, T.sections.latestNews)}</h1></div>
      </section>
      <section className="container-content py-14">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.length === 0 && <p className="text-muted-foreground">{lang === 'bn' ? 'কোনো খবর নেই।' : 'No news yet.'}</p>}
          {posts.map((n) => (
            <Link key={n.slug} href={localePath(lang, `/news/${n.slug}`)} className="overflow-hidden rounded-xl border border-line bg-white shadow-card hover:shadow-header">
              {n.coverUrl && <div className="relative aspect-video bg-bg-soft"><Image src={n.coverUrl} alt="" fill className="object-cover" sizes="400px" /></div>}
              <div className="p-5">
                <h3 className="font-display font-semibold text-navy">{pick(lang, n.titleEn, n.titleBn)}</h3>
                {n.publishedAt && <p className="mt-2 text-xs text-muted-foreground">{n.publishedAt.toLocaleDateString('en-GB')}</p>}
              </div>
            </Link>
          ))}
        </div>
      </section>
    </SiteShell>
  );
}

export interface NewsPostData {
  titleEn: string; titleBn: string | null;
  bodyEn: string | null; bodyBn: string | null;
  coverUrl: string | null; publishedAt: Date | null;
}

export function NewsDetailContent({ lang, company, post }: { lang: Lang; company: ShellCompany; post: NewsPostData }) {
  return (
    <SiteShell lang={lang} company={company}>
      <article className="container-content max-w-3xl py-14">
        <h1 className="font-display text-3xl font-bold text-navy">{pick(lang, post.titleEn, post.titleBn)}</h1>
        {post.publishedAt && <p className="mt-2 text-sm text-muted-foreground">{post.publishedAt.toLocaleDateString('en-GB')}</p>}
        {post.coverUrl && (
          <div className="relative mt-6 aspect-video overflow-hidden rounded-xl bg-bg-soft">
            <Image src={post.coverUrl} alt="" fill className="object-cover" sizes="800px" />
          </div>
        )}
        <div className="prose mt-6 whitespace-pre-line text-ink/80">{pick(lang, post.bodyEn, post.bodyBn)}</div>
      </article>
    </SiteShell>
  );
}
