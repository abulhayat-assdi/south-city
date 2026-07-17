/**
 * Generates placeholder brand assets (WebP renders, favicons, OG image).
 * Every raster asset here is a PLACEHOLDER — the owner replaces them via
 * Sanity (or by dropping real renders into src/assets/img/) later.
 *
 * Run: npm run assets
 */
import sharp from 'sharp';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const img = join(root, 'src', 'assets', 'img');
const pub = join(root, 'public');
mkdirSync(img, { recursive: true });

const NAVY = '#14245C';
const NAVY_DEEP = '#0E1A44';
const GOLD = '#C9A227';
const GOLD_LIGHT = '#E2C56B';
const SOFT = '#F6F7FA';

const toWebp = (svg, file, w, q = 72) =>
  sharp(Buffer.from(svg)).resize(w).webp({ quality: q }).toFile(join(img, file));
const toPng = (svg, file, w) =>
  sharp(Buffer.from(svg)).resize(w).png().toFile(join(pub, file));

const label = (x, y, text, size = 28, fill = '#ffffff', anchor = 'middle', weight = 600) =>
  `<text x="${x}" y="${y}" font-family="Arial, Helvetica, sans-serif" font-size="${size}" font-weight="${weight}" fill="${fill}" text-anchor="${anchor}">${text}</text>`;

/* ---------------------------------------------------------------- hero */
// Gateway at dusk: navy sky, gold-lit gate silhouette, boulevard perspective.
const hero = `
<svg xmlns="http://www.w3.org/2000/svg" width="1920" height="1080" viewBox="0 0 1920 1080">
  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${NAVY_DEEP}"/>
      <stop offset="0.55" stop-color="${NAVY}"/>
      <stop offset="0.8" stop-color="#3A4A8C"/>
      <stop offset="1" stop-color="#8A6D2F"/>
    </linearGradient>
    <radialGradient id="glow" cx="0.5" cy="0.72" r="0.45">
      <stop offset="0" stop-color="${GOLD_LIGHT}" stop-opacity="0.95"/>
      <stop offset="0.5" stop-color="${GOLD}" stop-opacity="0.35"/>
      <stop offset="1" stop-color="${GOLD}" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="road" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#2A3352"/>
      <stop offset="1" stop-color="#151B33"/>
    </linearGradient>
  </defs>
  <rect width="1920" height="1080" fill="url(#sky)"/>
  <circle cx="960" cy="770" r="430" fill="url(#glow)"/>
  <!-- distant skyline -->
  <g fill="#0B1330" opacity="0.85">
    <rect x="120" y="640" width="90" height="140"/><rect x="240" y="600" width="70" height="180"/>
    <rect x="1620" y="620" width="80" height="160"/><rect x="1730" y="580" width="100" height="200"/>
  </g>
  <!-- gate pillars -->
  <g>
    <rect x="590" y="380" width="150" height="420" rx="10" fill="#0B1330"/>
    <rect x="1180" y="380" width="150" height="420" rx="10" fill="#0B1330"/>
    <rect x="620" y="410" width="90" height="360" rx="6" fill="${NAVY_DEEP}" stroke="${GOLD}" stroke-width="6"/>
    <rect x="1210" y="410" width="90" height="360" rx="6" fill="${NAVY_DEEP}" stroke="${GOLD}" stroke-width="6"/>
    <rect x="560" y="330" width="210" height="56" rx="12" fill="${GOLD}"/>
    <rect x="1150" y="330" width="210" height="56" rx="12" fill="${GOLD}"/>
    <rect x="700" y="260" width="520" height="72" rx="14" fill="${NAVY_DEEP}" stroke="${GOLD}" stroke-width="6"/>
    ${label(960, 308, 'SOUTH CITY', 44, GOLD_LIGHT)}
  </g>
  <!-- boulevard -->
  <path d="M0 1080 L780 800 H1140 L1920 1080 Z" fill="url(#road)"/>
  <path d="M952 800 h16 L1010 1080 h-100 Z" fill="${GOLD}" opacity="0.75"/>
  <!-- palms -->
  <g stroke="#0B1330" stroke-width="14" fill="none" opacity="0.9">
    <path d="M420 1010 C 430 900 425 860 440 810"/>
    <path d="M1500 1010 C 1490 900 1495 860 1480 810"/>
  </g>
  <g fill="#0B1330" opacity="0.9">
    <ellipse cx="443" cy="800" rx="86" ry="26" transform="rotate(-18 443 800)"/>
    <ellipse cx="443" cy="800" rx="86" ry="26" transform="rotate(22 443 800)"/>
    <ellipse cx="1477" cy="800" rx="86" ry="26" transform="rotate(18 1477 800)"/>
    <ellipse cx="1477" cy="800" rx="86" ry="26" transform="rotate(-22 1477 800)"/>
  </g>
  ${label(960, 1050, 'PLACEHOLDER RENDER — replace with the real gateway image via CMS', 22, '#9AA3BD')}
</svg>`;

/* ---------------------------------------------------------- master plan */
const planBlock = (x, y, w, h, fill, stroke, t1, t2, tfill = '#fff') => `
  <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="14" fill="${fill}" stroke="${stroke}" stroke-width="3"/>
  ${label(x + w / 2, y + h / 2 - 4, t1, 30, tfill)}
  ${t2 ? label(x + w / 2, y + h / 2 + 30, t2, 20, tfill, 'middle', 400) : ''}`;

const masterplan = `
<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="1200" viewBox="0 0 1600 1200">
  <rect width="1600" height="1200" fill="${SOFT}"/>
  <rect x="20" y="20" width="1560" height="1160" rx="18" fill="#ffffff" stroke="${NAVY}" stroke-width="3"/>
  <!-- Dhaleshwari river (east/right) -->
  <path d="M1430 20 C 1380 300 1470 700 1400 1180 L1580 1180 L1580 20 Z" fill="#BFD8EE"/>
  ${label(1490, 600, 'Dhaleshwari River', 26, '#3E6C99')}
  <!-- embankment road -->
  <path d="M1408 20 C 1358 300 1448 700 1378 1180" stroke="${GOLD}" stroke-width="10" fill="none"/>
  <!-- KC Road (west/left) -->
  <rect x="52" y="20" width="26" height="1160" fill="#39456F"/>
  ${label(65, 610, 'KC ROAD', 24, '#fff', 'middle')}
  <!-- 60ft central boulevard -->
  <rect x="90" y="560" width="1300" height="52" fill="#39456F"/>
  <rect x="90" y="583" width="1300" height="6" fill="${GOLD}"/>
  ${label(740, 548, '60 FT MAIN BOULEVARD', 24, '#39456F')}
  <!-- sectors -->
  ${planBlock(120, 70, 560, 420, '#E9EDF8', NAVY, 'SECTOR A', 'Residential 3 - 5 Katha', NAVY)}
  ${planBlock(760, 70, 560, 420, '#E9EDF8', NAVY, 'SECTOR B', 'Residential 5 - 10 Katha', NAVY)}
  ${planBlock(120, 680, 560, 430, '#E9EDF8', NAVY, 'SECTOR C', 'Residential and Commercial', NAVY)}
  ${planBlock(760, 680, 560, 430, '#E9EDF8', NAVY, 'SECTOR D', 'Riverside Residential', NAVY)}
  <!-- landmarks -->
  ${planBlock(560, 430, 320, 130, NAVY, GOLD, 'CENTRAL MOSQUE', '')}
  ${planBlock(200, 430, 260, 110, GOLD, GOLD, 'SCHOOL ZONE', '', NAVY)}
  ${planBlock(1000, 430, 260, 110, GOLD, GOLD, 'HEALTH CENTRE', '', NAVY)}
  ${planBlock(200, 640, 300, 90, '#39456F', NAVY, 'COMMERCIAL AREA', '')}
  ${planBlock(1000, 640, 260, 90, '#3E8E5A', '#2C6B42', 'GREEN PARK', '')}
  ${label(800, 1160, 'ILLUSTRATIVE MASTER PLAN (placeholder) — replace with the official sector layout via CMS', 22, '#5B6472')}
</svg>`;

/* -------------------------------------------------------------- gallery */
const scene = (title, sub, base = NAVY) => `
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800" viewBox="0 0 1200 800">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${base}"/><stop offset="1" stop-color="${NAVY_DEEP}"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="800" fill="url(#g)"/>
  <circle cx="600" cy="560" r="330" fill="${GOLD}" opacity="0.14"/>
  <g fill="none" stroke="${GOLD}" stroke-width="5" opacity="0.9">
    <rect x="420" y="300" width="360" height="230" rx="12"/>
    <path d="M420 300 L600 190 L780 300"/>
  </g>
  <rect x="0" y="640" width="1200" height="160" fill="#0B1330" opacity="0.55"/>
  ${label(600, 706, title, 40, GOLD_LIGHT)}
  ${label(600, 752, sub + ' — placeholder render, replace via CMS', 20, '#C6CCE0', 'middle', 400)}
</svg>`;

/* ------------------------------------------------------- landmark maps */
const miniMap = (title) => `
<svg xmlns="http://www.w3.org/2000/svg" width="900" height="700" viewBox="0 0 900 700">
  <rect width="900" height="700" fill="#EEF1F7"/>
  <path d="M-20 520 C 240 430 380 610 920 470" stroke="#ffffff" stroke-width="34" fill="none"/>
  <path d="M-20 520 C 240 430 380 610 920 470" stroke="${GOLD}" stroke-width="4" fill="none" stroke-dasharray="18 14"/>
  <path d="M300 -20 C 340 240 260 480 330 720" stroke="#ffffff" stroke-width="26" fill="none"/>
  <circle cx="450" cy="330" r="66" fill="${NAVY}"/>
  <circle cx="450" cy="330" r="66" fill="none" stroke="${GOLD}" stroke-width="5"/>
  ${label(450, 340, 'SC', 44, GOLD_LIGHT)}
  <g fill="${GOLD}"><circle cx="660" cy="470" r="14"/><circle cx="240" cy="500" r="14"/><circle cx="700" cy="220" r="14"/></g>
  <rect x="0" y="600" width="900" height="100" fill="${NAVY_DEEP}" opacity="0.85"/>
  ${label(450, 660, title + ' (placeholder locator map)', 26, '#fff')}
</svg>`;

/* ------------------------------------------------------------ logo/emblem */
const emblem = (size = 512) => `
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 512 512">
  <circle cx="256" cy="256" r="248" fill="${NAVY}"/>
  <circle cx="256" cy="256" r="248" fill="none" stroke="${GOLD}" stroke-width="14"/>
  <circle cx="256" cy="256" r="196" fill="none" stroke="${GOLD}" stroke-width="6"/>
  <text x="256" y="308" font-family="Georgia, 'Times New Roman', serif" font-size="170" font-weight="700" fill="${GOLD_LIGHT}" text-anchor="middle">SD</text>
  <path d="M150 368 h212" stroke="${GOLD}" stroke-width="8"/>
  <text x="256" y="150" font-family="Arial, sans-serif" font-size="40" letter-spacing="6" font-weight="700" fill="#fff" text-anchor="middle">SOUTH CITY</text>
</svg>`;

/* --------------------------------------------------------------- OG image */
const og = `
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${NAVY_DEEP}"/><stop offset="1" stop-color="${NAVY}"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <circle cx="1060" cy="520" r="330" fill="${GOLD}" opacity="0.12"/>
  <circle cx="190" cy="190" r="110" fill="${NAVY}" stroke="${GOLD}" stroke-width="8"/>
  <circle cx="190" cy="190" r="82" fill="none" stroke="${GOLD}" stroke-width="3"/>
  <text x="190" y="216" font-family="Georgia, serif" font-size="76" font-weight="700" fill="${GOLD_LIGHT}" text-anchor="middle">SD</text>
  ${label(360, 175, 'SOUTH CITY', 84, '#ffffff', 'start', 800)}
  ${label(363, 232, 'Where Your Dream Finds Its Address', 34, GOLD_LIGHT, 'start', 400)}
  <path d="M100 330 h1000" stroke="${GOLD}" stroke-width="3" opacity="0.6"/>
  ${label(100, 405, 'Planned residential and commercial plots', 40, '#ffffff', 'start', 600)}
  ${label(100, 462, 'Sayedpur, South Keraniganj, Dhaka - beside the Dhaka-Mawa Expressway', 28, '#C6CCE0', 'start', 400)}
  ${label(100, 555, '500 Bigha  |  4 Sectors  |  3 - 5 - 10 Katha plots', 34, GOLD_LIGHT, 'start', 600)}
</svg>`;

/* ---------------------------------------------------------------- run */
await Promise.all([
  toWebp(hero, 'hero.webp', 1920, 70),
  toWebp(masterplan, 'masterplan.webp', 1600, 78),
  toWebp(scene('Gateway Entrance', 'South City main gate render'), 'gallery-1.webp', 1200),
  toWebp(scene('60 ft Boulevard', 'Main boulevard render', '#1B2E6E'), 'gallery-2.webp', 1200),
  toWebp(scene('Central Mosque', 'Mosque complex render', '#122052'), 'gallery-3.webp', 1200),
  toWebp(scene('Green Park and Trails', 'Open green spaces', '#1C3A63'), 'gallery-4.webp', 1200),
  toWebp(scene('Riverside Embankment', 'Dhaleshwari riverside walk', '#16295F'), 'gallery-5.webp', 1200),
  toWebp(scene('Plot Development', 'Sector road and plot progress', '#0F1D4A'), 'gallery-6.webp', 1200),
  toWebp(miniMap('Connectivity'), 'landmark-connectivity.webp', 900),
  toWebp(miniMap('Education'), 'landmark-education.webp', 900),
  toWebp(miniMap('Health'), 'landmark-health.webp', 900),
  toWebp(miniMap('Daily Needs'), 'landmark-daily.webp', 900),
  toPng(og, 'og-image.png', 1200),
  toPng(emblem(), 'icon-512.png', 512),
  toPng(emblem(), 'apple-touch-icon.png', 180),
  toPng(emblem(), 'favicon-32.png', 32),
  toPng(emblem(), 'favicon-48.png', 48),
]);

writeFileSync(join(pub, 'favicon.svg'), emblem(64));

/* Minimal valid placeholder PDF for the brochure download. */
const pdfText = 'South City - Brochure placeholder. Upload the real PDF via the CMS (Sanity > Brochure).';
const pdf = `%PDF-1.4
1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj
2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj
3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 612 792]/Resources<</Font<</F1 4 0 R>>>>/Contents 5 0 R>>endobj
4 0 obj<</Type/Font/Subtype/Type1/BaseFont/Helvetica>>endobj
5 0 obj<</Length ${pdfText.length + 60}>>stream
BT /F1 14 Tf 50 740 Td (${pdfText}) Tj ET
endstream
endobj
trailer<</Root 1 0 R/Size 6>>
%%EOF`;
// served via the /brochure/south-city-brochure.pdf build-time endpoint
writeFileSync(join(root, 'src', 'assets', 'brochure.pdf'), pdf);

writeFileSync(
  join(pub, 'robots.txt'),
  'User-agent: *\nAllow: /\n\nSitemap: https://southcity.pages.dev/sitemap-index.xml\n'
);

console.log('✅ Placeholder assets generated: src/assets/img + public/');
