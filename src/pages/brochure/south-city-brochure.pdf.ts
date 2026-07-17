/**
 * Static-file endpoint: emits the brochure PDF into dist/ at build time.
 * If the owner uploaded a brochure in Sanity, it is DOWNLOADED here during
 * the build and served from Cloudflare — never hotlinked from Sanity's CDN
 * (spec §8). Falls back to the placeholder PDF in src/assets/.
 */
import type { APIRoute } from 'astro';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { remoteBrochureUrl } from '../../content';

export const GET: APIRoute = async () => {
  const headers = {
    'Content-Type': 'application/pdf',
    'Content-Disposition': 'attachment; filename="south-city-brochure.pdf"',
  };

  if (remoteBrochureUrl) {
    try {
      const res = await fetch(remoteBrochureUrl);
      if (res.ok) return new Response(await res.arrayBuffer(), { headers });
      console.warn('[brochure] Sanity download failed, using local placeholder');
    } catch (err) {
      console.warn('[brochure] Sanity download failed, using local placeholder:', err);
    }
  }

  // resolved from the project root — import.meta.url points into dist/ at build
  const buf = await readFile(join(process.cwd(), 'src', 'assets', 'brochure.pdf'));
  return new Response(buf, { headers });
};
