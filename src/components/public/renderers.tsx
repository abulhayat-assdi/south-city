import { notFound } from 'next/navigation';
import { type Lang } from '@/lib/public-i18n';
import {
  getCompany,
  getPublishedProjects,
  getProjectBySlug,
  getPublishedNews,
  getNewsBySlug,
  getLeaderByRole,
} from '@/server/public-data';
import { HomeContent } from './home-content';
import { AboutContent } from './about-content';
import { LeaderContent } from './leader-content';
import { ProjectsListContent } from './projects-list-content';
import { ProjectDetailContent } from './project-detail-content';
import { NewsListContent, NewsDetailContent } from './news-content';
import { ContactContent } from './contact-content';

// Each renderer loads data server-side and returns the bilingual content for the
// given language. bn ("/") and en ("/en") route files are thin wrappers over these.

export async function renderHome(lang: Lang) {
  const [company, projects, news] = await Promise.all([getCompany(), getPublishedProjects(), getPublishedNews(3)]);
  return <HomeContent lang={lang} company={company} projects={projects} news={news} />;
}

export async function renderAbout(lang: Lang) {
  const company = await getCompany();
  return <AboutContent lang={lang} company={company} />;
}

export async function renderLeader(lang: Lang, role: 'CHAIRMAN' | 'MD') {
  const [company, leader] = await Promise.all([getCompany(), getLeaderByRole(role)]);
  if (!leader) notFound();
  return <LeaderContent lang={lang} company={company} leader={leader} />;
}

export async function renderProjectsList(lang: Lang) {
  const [company, projects] = await Promise.all([getCompany(), getPublishedProjects()]);
  return <ProjectsListContent lang={lang} company={company} projects={projects} />;
}

export async function renderProjectDetail(lang: Lang, slug: string) {
  const [company, project] = await Promise.all([getCompany(), getProjectBySlug(slug)]);
  if (!project) notFound();
  return <ProjectDetailContent lang={lang} company={company} project={project} />;
}

export async function renderNewsList(lang: Lang) {
  const [company, posts] = await Promise.all([getCompany(), getPublishedNews(24)]);
  return <NewsListContent lang={lang} company={company} posts={posts} />;
}

export async function renderNewsDetail(lang: Lang, slug: string) {
  const [company, post] = await Promise.all([getCompany(), getNewsBySlug(slug)]);
  if (!post) notFound();
  return <NewsDetailContent lang={lang} company={company} post={post} />;
}

export async function renderContact(lang: Lang) {
  const company = await getCompany();
  return <ContactContent lang={lang} company={company} />;
}
