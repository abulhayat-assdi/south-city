# 🔴 Placeholders to replace before launch

Everything below is a stand-in (per spec §10 — unconfirmed items). Replace the
value, rebuild (or publish via Sanity once connected), and it goes live.

## Contact & identity (in `src/content/site.ts` → `settings`)

| Item | Placeholder used | Where it appears |
|---|---|---|
| Sales phone | `+8801862534626` / display `01862-534626` | Header "Call Now", sticky bar Call, footer, lead-form success card, JSON-LD |
| WhatsApp number | `8801862534626` | Every WhatsApp button (hero, sticky bar, FAB, plot "Reserve", master-plan card, form fallback, footer) |
| Public email | `contact.southcity2020@gmail.com` | Footer, JSON-LD |
| Office address | "Rahman Chamber (Level 4), Motijheel C/A, Dhaka-1000" (EN+BN) | Footer, JSON-LD |
| Company legal name | "South Dhaka Properties & Housing Ltd." (brochure version) | Header sub-line, footer, facts block, copyright |
| Social links | Bare `facebook.com` / `youtube.com` / `linkedin.com` | Footer icons |

## Commerce

| Item | Placeholder used | Where |
|---|---|---|
| Plot prices (3/5/10 Katha) | "Call for price" / "মূল্যের জন্য কল করুন" | Plot tabs |
| Booking money | "Call for details" | Plot tabs |
| Web3Forms access key | `YOUR_WEB3FORMS_ACCESS_KEY` | `src/content/site.ts` (or set env `PUBLIC_WEB3FORMS_KEY`) — form will NOT deliver email until replaced |

## Media (all generated placeholder art — replace with real renders)

| Item | File | Note |
|---|---|---|
| Hero gateway render | `src/assets/img/hero.webp` | Or upload via Sanity → Hero |
| Master plan illustration | `src/assets/img/masterplan.webp` | Or Sanity → Master Plan. Hotspot positions (`src/content/site.ts` → `hotspots`, x/y %) must be re-tuned to the real image |
| Gallery ×6 | `src/assets/img/gallery-1…6.webp` | Or Sanity → Gallery |
| Neighborhood locator maps ×4 | `src/assets/img/landmark-*.webp` | |
| Brochure PDF | `src/assets/brochure.pdf` (1-page placeholder) | Or Sanity → Brochure |
| Logo / favicon / OG image | `public/favicon.svg`, `favicon-32.png`, `apple-touch-icon.png`, `icon-512.png`, `og-image.png` | Generated "SD" emblem — swap for the real logo exports (`npm run assets` regenerates the placeholders) |

## Config

| Item | Placeholder | Where |
|---|---|---|
| Production domain | `https://southcity.pages.dev` | `astro.config.mjs` (`site`), `public/robots.txt` sitemap line |
| Sanity project ID | `YOUR_SANITY_PROJECT_ID` / empty env | `sanity/sanity.config.ts`, `.env.example` |
| GA4 / Meta Pixel IDs | commented-out block | `src/layouts/BaseLayout.astro` `<head>` |
| Google Map pin | search query "Sayedpur, South Keraniganj, Dhaka" | `src/content/site.ts` → `settings.mapQuery` — replace with exact plus-code/coords for a precise pin |

## Content notes (verify with the owner)

- Plot **dimensions** (36×60 ft etc.) are illustrative approximations I derived
  from the Katha areas — confirm real plot dimensions.
- Neighborhood tab items marked "Planned within South City" / "Within 6 km" are
  conservative phrasings from the spec's facts — refine with real named schools,
  hospitals, bazaars when available.
- Bangla copy should be proof-read by a native reader before launch (spec §13).
