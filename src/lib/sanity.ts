/**
 * Build-time Sanity fetch — no runtime dependency, no client JS.
 *
 * When SANITY_PROJECT_ID is set (in .env or Cloudflare Pages env vars), the
 * site pulls owner-edited content at build time and merges it over the local
 * defaults in src/content/site.ts. When it is NOT set, the site builds
 * entirely from local content — so the project works before the CMS exists.
 *
 * 🔴 Image-serving rule (spec §8): Sanity image URLs returned here are passed
 * through Astro's <Image> at build time (see astro.config image.domains), so
 * the optimized files are emitted into dist/ and served by Cloudflare.
 * Visitors never hit Sanity's CDN.
 */

const projectId = import.meta.env.SANITY_PROJECT_ID as string | undefined;
const dataset = (import.meta.env.SANITY_DATASET as string | undefined) ?? 'production';
const apiVersion = '2024-01-01';

export const sanityEnabled = Boolean(projectId);

async function query<T>(groq: string): Promise<T | null> {
  if (!projectId) return null;
  const url = `https://${projectId}.apicdn.sanity.io/v${apiVersion}/data/query/${dataset}?query=${encodeURIComponent(groq)}`;
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Sanity query failed: ${res.status}`);
    const { result } = (await res.json()) as { result: T };
    return result;
  } catch (err) {
    console.warn('[sanity] falling back to local content:', err);
    return null;
  }
}

/** Shape of the (partial) content overrides coming from Sanity. */
export interface RemoteContent {
  settings?: Record<string, unknown> | null;
  hero?: { headline?: unknown; subline?: unknown; image?: string | null } | null;
  overview?: { paragraph?: unknown; counters?: unknown[] } | null;
  trustBadges?: unknown[] | null;
  facts?: unknown[] | null;
  plots?: unknown[] | null;
  amenities?: unknown[] | null;
  landmarkTabs?: unknown[] | null;
  masterPlanImage?: string | null;
  gallery?: { url: string; caption?: unknown }[] | null;
  brochureUrl?: string | null;
}

const GROQ = /* groq */ `{
  "settings": *[_type == "siteSettings"][0]{
    companyName, phone, phoneDisplay, whatsapp, email, address, social
  },
  "hero": *[_type == "hero"][0]{
    headline, subline, "image": image.asset->url
  },
  "overview": *[_type == "overview"][0]{ paragraph, counters },
  "trustBadges": *[_type == "trustBadge"] | order(orderRank asc){ icon, label },
  "facts": *[_type == "projectFact"] | order(orderRank asc){ label, value },
  "plots": *[_type == "plot"] | order(katha.en asc){
    "id": _id, katha, sqft, dimensions, price, booking, installment
  },
  "amenities": *[_type == "amenity"] | order(orderRank asc){ icon, label },
  "landmarkTabs": *[_type == "landmarkTab"] | order(orderRank asc){
    "id": _id, label, items
  },
  "masterPlanImage": *[_type == "masterPlan"][0].image.asset->url,
  "gallery": *[_type == "galleryImage"] | order(orderRank asc){
    "url": image.asset->url, caption
  },
  "brochureUrl": *[_type == "brochure"][0].file.asset->url
}`;

let cache: RemoteContent | null | undefined;

export async function fetchRemoteContent(): Promise<RemoteContent | null> {
  if (cache !== undefined) return cache;
  cache = await query<RemoteContent>(GROQ);
  if (cache) console.log('[sanity] content loaded from project', projectId);
  return cache;
}
