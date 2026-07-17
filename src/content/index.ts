/**
 * Merged site content: local defaults (site.ts) + optional Sanity overrides.
 * Server-only (top-level await + env access) — client scripts must import
 * from './site' instead (see src/scripts/plan-data.ts).
 */
import * as local from './site';
import { fetchRemoteContent } from '../lib/sanity';

const remote = await fetchRemoteContent();

/** Use the remote array only when it exists and is non-empty. */
const arr = <T>(remoteArr: unknown[] | null | undefined, fallback: T[]): T[] =>
  Array.isArray(remoteArr) && remoteArr.length > 0 ? (remoteArr as T[]) : fallback;

export const settings = {
  ...local.settings,
  ...(remote?.settings ?? {}),
} as typeof local.settings;

export const hero = {
  ...local.hero,
  ...(remote?.hero?.headline ? { headline: remote.hero.headline as typeof local.hero.headline } : {}),
  ...(remote?.hero?.subline ? { subline: remote.hero.subline as typeof local.hero.subline } : {}),
};

export const overview = {
  paragraph: (remote?.overview?.paragraph as typeof local.overview.paragraph) ?? local.overview.paragraph,
  counters: arr(remote?.overview?.counters, local.overview.counters),
};

export const trustBadges = arr(remote?.trustBadges, local.trustBadges);
export const facts = arr(remote?.facts, local.facts);
export const plots = arr(remote?.plots, local.plots);
export const amenities = arr(remote?.amenities, local.amenities);
export const hotspots = local.hotspots; // hotspot positions stay code-managed
export const distances = local.distances;
export const boundaries = local.boundaries;
export const galleryCaptions = local.galleryCaptions;
export const { WEB3FORMS_KEY } = local;

// landmark tab items can be edited in Sanity; tab ids/images stay code-managed
export const landmarkTabs = local.landmarkTabs.map((tab) => {
  const remoteTab = (remote?.landmarkTabs as typeof local.landmarkTabs | undefined)?.find(
    (rt) => (rt as { label?: { en?: string } }).label?.en === tab.label.en
  );
  return remoteTab ? { ...tab, items: remoteTab.items ?? tab.items } : tab;
});

/** Remote (Sanity CDN) image URLs — passed through Astro <Image> at build. */
export const remoteImages = {
  hero: remote?.hero?.image ?? null,
  masterPlan: remote?.masterPlanImage ?? null,
  gallery: remote?.gallery ?? null,
};

/** Sanity brochure URL — downloaded at build by the /brochure endpoint. */
export const remoteBrochureUrl = remote?.brochureUrl ?? null;

export const waLink = (lang: 'en' | 'bn', text?: string) =>
  `https://wa.me/${settings.whatsapp}?text=${encodeURIComponent(text ?? settings.waText[lang])}`;
