# South City — Website Build Instructions (v2 — Final)

**For:** Claude Code (Fable 5) — build this project step by step.
**Client:** South Dhaka Properties & Housing Ltd. — project "South City".
**Deliverable:** A fast, mobile-responsive, bilingual (বাংলা / English) single-project land-development landing page.

---

## 🧭 কীভাবে এই ফাইল ব্যবহার করবেন (for the site owner)

এই ফাইলটা Claude Code (Fable 5)-কে দিন। এটাই সাইট বানানোর সম্পূর্ণ ব্লুপ্রিন্ট — টেক স্ট্যাক, কালার, প্রতিটা সেকশন, মোবাইল রেস্পন্সিভনেস, CMS (নিজে এডিট করার প্যানেল), লিড ফর্ম, আর ডিপ্লয় — সব এখানে লেখা আছে। Claude Code-কে প্রথমে বলুন **§2-এর রেফারেন্স সাইটটা ব্রাউজ করে দেখতে**, তারপর §11-এর build order অনুযায়ী কাজ শুরু করতে।

> **Instruction to the coding agent:** Read this entire document first. Then **open and study the reference site in a browser** (Section 2) before writing any code. Follow the build order in Section 11. Ask the owner only for the items marked 🔴 in Section 10 (real contact details).

---

## 1. Project Goal & Summary

Build a **single-project landing page** for "South City", a ~500-bigha planned residential + commercial land development in Sayedpur, South Keraniganj, Dhaka. The page's one job: convince a Bangladeshi land buyer that the project is legitimate, well-located, and worth enquiring about — then make it one tap to **call or WhatsApp**.

Core requirements:
- Visual layout modeled on the **Aroland "Home 6"** demo (Section 2).
- **South City brand colors** — navy + gold on white (Section 4).
- **Bilingual** Bangla/English with a language toggle (Section 5).
- **Mobile-first & fast** — most visitors are on mid-range Android over 4G (Section 7).
- **Owner can edit text / images / brochure themselves** via a CMS (Section 8).
- **No database.** Leads go to WhatsApp + email (Section 9).

---

## 2. Reference Site to Study (browse this first)

**Primary layout reference:** https://demo2.wpopal.com/aroland/home-6/

Open it in a browser, resize to mobile width, and note the section order and interactions. We are **reproducing its structure and layout feel**, NOT its content or its WordPress code. Replace every "Aroland luxury apartment" idea with "South City land/plot" content.

**Also look at (for borrowed pieces):** https://demo2.wpopal.com/aroland/home-2/ — borrow its numbered "project facts" block and its interactive block/sector map idea.

### Home-6 section order → what we build instead

| Home-6 section | South City equivalent |
|---|---|
| Full-screen hero slider ("explore aroland") | Hero with South City gateway render + headline + dual CTA |
| Overview "no place like home" + counters | Overview + counters (500 Bigha · 4 Sectors · 3/5/10 Katha · 40% land acquired) |
| Location + Google Map + gallery | Location: Google Map (Sayedpur) + distance chart + site gallery |
| Amenities numbered list (01–12) + play video | Facilities list (schools, mosque, health centre, etc.) + optional project video |
| Neighborhood images + brochure | Local landmarks / connectivity images + **Download Brochure (PDF)** |
| Floorplan **tabs** (1BR/2BR/3BR/studio/penthouse) | **Plot-size tabs: 3 Katha · 5 Katha · 10 Katha** (dimensions + price) |
| Interior gallery (6 images) | **Master Plan + renders gallery** (interiors are irrelevant for raw land) |
| Pricing form (name/phone/email) | **Lead-capture form** → WhatsApp + email |
| Footer (Location / Call / Email + links) | 3-column footer: address · phone · email + quick links + socials |
| — (not in demo) | **Sticky bottom bar (mobile): Call + WhatsApp** — always visible |
| — (not in demo) | **Floating WhatsApp button** (desktop + mobile) |

---

## 3. Tech Stack (final — with rationale)

| Layer | Choice | Why |
|---|---|---|
| **Framework** | **Astro** | Outputs near-zero-JS static HTML → fastest on BD mobile networks. Built-in i18n (bn/en) and image optimization. Ideal for a content landing page and easy for an AI agent to build. |
| **Styling** | **Tailwind CSS** | Utility classes, fast to build, easy responsive breakpoints. Brand tokens defined once (Section 4). |
| **Interactivity** | Vanilla JS / tiny Astro islands | Language toggle, plot tabs, mobile menu, sticky bar — no heavy framework needed. |
| **CMS (content editing)** | **Sanity** (free tier) | Owner logs into a browser panel to edit text, swap images, upload a new brochure PDF. Built-in image CDN + optimization. On "Publish", a deploy webhook rebuilds the site. (Alternative: Decap CMS — free, git-based — if you prefer content stored in GitHub.) |
| **Lead form** | **Web3Forms** (free) + WhatsApp deep link | Form emails the lead to the sales inbox; no backend. Also offer a one-tap WhatsApp pre-filled message. |
| **Database** | **None** | Images/PDF are files (repo or Sanity media library); leads go to email/WhatsApp. A DB (Supabase) is only needed later if an admin dashboard is wanted. |
| **Hosting** | **Cloudflare Pages** (free) | Global CDN (fast in Bangladesh), auto HTTPS, auto-deploy from GitHub. Owner buys **only a domain**; no paid hosting needed. |
| **Version control** | GitHub | Cloudflare Pages + Sanity webhook both build from the repo. |

> **Why NOT Next.js / React here:** React ships a large JavaScript bundle the phone must download and execute — good for app-like dashboards, but a needless speed penalty for a mostly-static marketing page. Astro gives the same component-based DX while shipping almost no JS, so it loads faster on 4G/3G. If South City later needs logins, a buyer portal, or many projects with filtering, migrating to Next.js is reasonable then — not now.

### 3.1 Free-tier capacity & cost (verified July 2026)

**Key principle:** the site is **static**. Visitors are served ready HTML/images from **Cloudflare's CDN** and never touch Sanity. Sanity is queried **only at build time** (when the owner publishes an edit). So **visitor volume is irrelevant to Sanity's limits** — it only affects Cloudflare, which has no traffic cap.

**Cloudflare Pages — Free plan**

| Item | Free-plan limit |
|---|---|
| Visitors / requests / bandwidth | **Unlimited** — no cap ✅ |
| Builds (rebuilds) | **500 / month** (1 build per content publish) |
| Files per site | 20,000 |
| Max single file size | 25 MiB |
| Custom domains | 100 |
| Concurrent builds | 1 |

→ **Millions of monthly visitors run entirely free.** The only ceiling is 500 rebuilds/month — unreachable for a landing page even with daily edits.

**Sanity — Free plan**

| Item | Free-plan allowance |
|---|---|
| Editor seats (Admin/Viewer) | 20 |
| Documents | 10,000 |
| Asset storage (images/PDF) | 20 GB |
| API requests | 250K + 500K CDN / month |
| Bandwidth | 10 GB / month |
| Datasets | 2 |

→ Because visitors don't hit Sanity, this landing page uses only a tiny fraction of these. 20 editor seats is plenty for a sales team.

**When you'd need to pay (not for this site):**
- **Cloudflare:** only if >500 builds/month or advanced features → not needed. (Pro ~$20/mo.)
- **Sanity:** only if >20 editors, >10K documents, scheduled publishing, or custom roles → not needed. (Growth ~$15/editor/mo.)
- **Web3Forms:** free tier is ~250 submissions/month. If lead volume exceeds that, either upgrade, or also post the form to a free Google Sheet (Section 9). Not a launch blocker.

**Bottom line:** the entire site — hosting, CMS, forms — **runs free at any realistic visitor volume**, provided images are served through Cloudflare (see the image-serving rule in Section 8), not hotlinked from Sanity.

---

## 4. Brand System

### 4.1 Colors (define as Tailwind theme tokens)

```js
// tailwind.config.mjs — theme.extend.colors
colors: {
  navy:      '#14245C', // primary — headers, headings, buttons
  'navy-deep':'#0E1A44', // footer, dark bars, hero overlay
  gold:      '#C9A227', // accent — CTAs, icons, borders, highlights
  'gold-light':'#E2C56B',
  whatsapp:  '#25D366', // WhatsApp buttons only
  ink:       '#1F2430', // body text
  muted:     '#5B6472',
  line:      '#E3E6EC',
  'bg-soft': '#F6F7FA', // alternating section background
}
```

Rules:
- **Page background:** white `#FFFFFF`; alternate sections use `bg-soft` `#F6F7FA`.
- **Dark sections** (footer, some bands): `navy-deep` background, white/gold text — matches the brochure banners.
- **Gold contrast warning:** gold on white fails accessibility for small text. Use gold only for large headings, icons, borders, and as a button *fill with navy text*. Never small gold body text on white.
- Buttons: primary = gold fill + navy text; secondary = navy outline; WhatsApp = `whatsapp` green fill + white.

### 4.2 Typography

Load from Google Fonts (subset Latin + Bengali, `display=swap`; self-host if easy):

| Role | Latin | Bangla |
|---|---|---|
| Display / headings | Poppins (600–800) | Hind Siliguri / Baloo Da 2 |
| Body | Inter / Open Sans (400–500) | Noto Sans Bengali / Hind Siliguri |

- Base 16px mobile / 17px desktop. Bangla needs more leading: set `line-height: 1.75` on `[lang="bn"]` blocks.
- Fluid headings: `h1 { font-size: clamp(2rem, 6vw, 3.25rem); }`.

### 4.3 Logo

- Provided assets: round **SD emblem** + horizontal **SOUTH CITY** wordmark.
- Header: wordmark (navy on white). Footer: white/gold version on navy.
- Emblem → favicon, WhatsApp avatar, Open Graph share image. Export SVG + PNG @2x. Favicons: 32/48/180/512px.

### 4.4 Taglines (use verbatim)

- Hero sub-line: **"Where Your Dream Finds Its Address."**
- Footer / bands: **"Building Landmark, Creating Legacy."**

---

## 5. Bilingual (বাংলা / English)

- **Default language: Bangla** (primary market). Provide an EN/বাং toggle in the header and at the top of the mobile menu. Persist choice in `localStorage`.
- Implement with **Astro i18n**: content in `src/content/{en,bn}` or a shared `t()` dictionary. Set `<html lang>` and per-block `lang="bn"` so the correct font + leading apply.
- Bangla strings run ~20–30% longer — make buttons/cards flex, never fixed width. Test hero, nav, and CTAs in Bangla specifically.
- Numbers: show prices with BDT sign **৳** and lakh/crore grouping — `৳ 12,50,000` not `৳ 1,250,000`. Decide once whether to use Bangla numerals (১২,৫০,০০০) in Bangla mode and stay consistent. Use `Intl.NumberFormat('en-IN', {style:'currency', currency:'BDT', maximumFractionDigits:0})`.
- Land unit is **Katha** (primary), sq ft secondary. Constants: `1 Katha = 720 sq ft ≈ 66.9 m²`, `1 Bigha = 20 Katha`.

---

## 6. Page Structure — Section-by-Section Spec

Single long-scroll page. Order and behavior below. Every section is full-width with a centered max-1200px content container; 16px side padding on mobile.

### 6.1 Header (sticky)
- Left: SOUTH CITY wordmark (h ~36px). Right: anchor nav (Overview · Master Plan · Plots · Location · Amenities · Contact) + language toggle + gold **"Call Now"** button.
- Height 72px desktop / 56px mobile. Solid white, subtle shadow after 40px scroll. Scroll-spy highlights current section in gold.
- **Mobile:** hamburger (44×44px) → full-width navy slide-down drawer, gold active state, 18px links, language toggle pinned top. Close on link tap / outside tap.

### 6.2 Hero
- Background: South City gateway render (the gold-gate dusk image) as one optimized WebP — **not a JS slider**. Navy 35–45% left→right gradient overlay for legible white text.
- H1: **"Where Your Dream Finds Its Address"** (Bangla equivalent when bn active). Sub-line: "Planned residential & commercial plots beside the Dhaka–Mawa Expressway, Sayedpur."
- USP chip row: Prime Location · Legal Security · High Growth · Family Focused · Premium Amenities.
- Two CTAs (≥48px tall): gold **"WhatsApp Us"** + outline **"Get Plot Details"** (scrolls to form).
- Asset: 1920px WebP (~q72) + 768px mobile crop via `<picture>`, target < 180 KB mobile; navy-solid LQIP to avoid layout shift.

### 6.3 Overview + counters
- Short intro paragraph (from brochure MD's message). Animated counters: **~500 Bigha · 4 Sectors · 3/5/10 Katha · 40% land acquired**. Counters animate on scroll into view.

### 6.4 Trust row (add — not in Home-6, but essential)
- Row of 4–6 badges. **Use only verifiable items:** Valid Trade License · Transparent Documentation · Registration on Full Payment · Up to 5-Year Installments · 40% Land Already Acquired · Dhaleshwari Riverside.
- 🔴 **Do NOT create a "RAJUK Approved" badge** — the project does not require and does not hold RAJUK approval (see Section 10). Do not show a REHAB logo either (membership not yet held).

### 6.5 Project at a glance (numbered facts — borrowed from Home-2)
- Two columns of numbered rows: Project, Developer, Total area, Sectors, Plot types (Residential & Commercial), Plot sizes, Road width (25/40/60 ft), Payment (full or up to 5-yr installment). Gold **"Download Brochure (PDF)"** button below (file from CMS).

### 6.6 Master plan / sector locator
- Base image: the **Master Plan & Sector Layout** illustration. Overlay `%`-positioned clickable hotspots on Sectors A–D + Central Mosque, School Zone, Health Centre, Commercial Area, Green Park. Tap → card with sector info + "Enquire on WhatsApp" deep link. Provide a stacked list fallback for very small screens.

### 6.7 Plot sizes & pricing tabs (repurposed floorplan tabs)
- Three tabs: **3 Katha · 5 Katha · 10 Katha**. Each shows dimensions, sq-ft equivalent, indicative price in ৳ (or "Call for price"), booking money, installment example, and a "Reserve this plot" CTA. Inline Katha↔sq ft note. **Mobile:** tabs collapse into an accordion.

### 6.8 Location & connectivity
- Embedded Google Map centered on Sayedpur / KC Road — **lazy-load the iframe** (load on scroll into view or behind a "Show map" button; a cold Maps iframe is very heavy on mobile).
- Distance chart beside it: Dhaka 22 km · Dhaka–Mawa Expressway 1.5 km · Padma Bridge 12 km · Keraniganj 6 km · Airport 30–35 min.
- Boundary facts (optional caption): West = KC Road; East = Dhaleshwari River + embankment road; North = Sayedpur Para; South = Nimtali.

### 6.9 Landmark / neighborhood tabs
- Re-label demo tabs to: **Connectivity · Education · Health · Daily Needs**. Numbered list + a small locator image per tab.

### 6.10 Amenities & facilities
- 12-item icon grid (3×4 desktop / 2×6 mobile): Schools · Mosques · Health Centre · Super Shop · Gym · Coffee Shop · Walking Trails · Green Open Spaces · 24/7 Security · Wide Roads · Backup Utilities · Children's Play Area. Gold icon circle + navy label. Optional "Watch project video" button (lazy-loaded YouTube facade).

### 6.11 Gallery
- 4–6 renders/site photos in a lazy-loaded responsive grid; optional lightbox. All WebP.

### 6.12 Lead-capture form
- Fields: Name*, Phone* (BD format), Plot size (select 3/5/10 Katha), Message. Keep to 4 fields.
- On submit → **Web3Forms** emails the sales inbox **and** show a success state; also provide a "Send on WhatsApp instead" button that opens a pre-filled `wa.me` message. No page reload; validate phone client-side.

### 6.13 Footer
- Deep-navy background, white/gold text, 3 columns: (1) logo + "Building Landmark, Creating Legacy"; (2) Contact — office address, phone (`tel:`), email; (3) Quick links + social icons (Facebook, YouTube, LinkedIn, WhatsApp).
- Copyright: `© 2026 South City · South Dhaka Properties & Housing Ltd. All rights reserved.`

### 6.14 Sticky conversion bar + floating WhatsApp (add)
- **Mobile:** fixed bottom bar, two 50/50 buttons — **Call** (navy) + **WhatsApp** (green). 56px tall, ≥48px targets. Add `padding-bottom` to page so it never covers the footer.
- **Desktop:** header "Call Now" + a bottom-right floating green WhatsApp FAB (56px, subtle pulse).
- Use real `tel:` and `wa.me` links (not JS handlers). Fire GA4 / Meta Pixel events on tap.

```html
<!-- WhatsApp deep link (replace number, no + or spaces) -->
https://wa.me/8801XXXXXXXXX?text=Assalamu%20Alaikum%2C%20I%27m%20interested%20in%20South%20City%20plots.
```

---

## 7. Mobile-First & Performance Specs

- **Breakpoints:** base 0–639 (single column, sticky bar, accordions) · sm/md 640–1023 (2-col, tabs appear) · lg 1024+ (full multi-column) · xl 1280+ (max content 1200px, centered).
- **Touch targets** ≥ 48×48px, ≥8px gap. Form inputs ≥48px height, 16px font (prevents iOS zoom).
- **Images:** WebP everywhere (AVIF optional w/ fallback), SVG for logo/icons. Budgets: hero ≤180 KB, section images ≤120 KB, thumbs ≤60 KB. Serve 768/1280/1920 via `srcset`/`<picture>`. Use Astro's `<Image>` for automatic optimization.
- **Lazy-load** everything below the fold (`loading="lazy"`); Google Map + gallery + video load on demand.
- Set explicit width/height or aspect-ratio (CLS ≈ 0). Inline critical CSS, defer non-critical JS, preconnect fonts.
- **Targets (Lighthouse mobile, 4G):** FCP < 2.0s · LCP < 2.5s · TBT < 200ms · CLS < 0.1 · total first-load < 1.2 MB · Performance ≥ 90.

---

## 8. CMS — Owner Self-Editing (Sanity)

Goal: the owner/sales team edits text, swaps images, and uploads a new brochure PDF from a browser — no code.

- Set up a **Sanity** project; define schemas so **every editable piece is a field**:
  - **Site settings:** phone, WhatsApp number, email, office address, social links.
  - **Hero:** headline (en/bn), sub-line (en/bn), background image.
  - **Overview:** paragraph (en/bn), the 4 counter values.
  - **Trust badges:** repeatable list (icon + label en/bn).
  - **Project facts:** the numbered key-value list.
  - **Plots:** repeatable (size in Katha, dimensions, price/text, installment note).
  - **Amenities:** repeatable (icon + label en/bn).
  - **Landmarks:** grouped by tab (name, distance, image).
  - **Gallery:** image list.
  - **Brochure:** a **file field** for the PDF (this is how they replace the downloadable brochure).
- **Images & PDF** live in Sanity's media library (its own CDN) — **not a database**. Astro fetches content at build; a **Sanity deploy webhook** triggers a Cloudflare Pages rebuild on Publish (site updates in ~1–2 min).
- 🔴 **Image-serving rule (important for staying free):** do **not** hotlink images directly from Sanity's CDN to visitors — that would burn Sanity's 10 GB/month bandwidth. Instead, **pull each Sanity image at build time and let Astro's `<Image>` optimize + emit it into `dist/`**, so all visitor image traffic is served from **Cloudflare's unlimited CDN** and Sanity bandwidth stays near zero. (Use `@sanity/astro` / `@sanity/image-url` to resolve the source, then pass it through Astro `<Image>`.) The brochure PDF can be served either from `public/` (rebuilt on publish) or a Cloudflare-fronted URL — not hotlinked from Sanity.
- All text fields are **bilingual objects** `{ en, bn }` so the toggle works.
- **Alternative if preferred:** Decap CMS (free, git-based) — commits content to GitHub, Cloudflare rebuilds. Simpler infra, slightly less polished editor. Pick Sanity for the nicer image handling.

> If the owner chose "start simple", instead keep content in `src/content/*.json|md` (still bilingual objects) and images/PDF in `src/assets/` and `public/`. Structure it cleanly so a CMS can be layered on later without rewrites.

---

## 9. Lead Handling (no database)

- **Web3Forms:** create a free access key; POST the form to it; it emails the lead to the sales inbox. Add a honeypot field for spam.
- **WhatsApp fallback:** "Send on WhatsApp" button builds a `wa.me` link with the entered name/plot pre-filled.
- **Optional Google Sheets:** if the owner wants a running list, add a Google Apps Script webhook or Sheet.best endpoint the form also posts to. Still no DB.
- Track `call_click`, `whatsapp_click`, `form_submit` in GA4 + Meta Pixel.

---

## 10. Project Data (fill the site with these real facts)

**Project:** South City — a project of South Dhaka Properties & Housing Ltd.
**Type:** Planned residential + commercial land development (plots).
**Location:** Sayedpur, South Keraniganj, Dhaka — beside KC Road; near Dhaka–Mawa Expressway & Eastern Bypass.
**Size:** ~500 Bigha · **4 sectors** (A, B, C, D).
**Plot sizes:** 3, 5 & 10 Katha (residential & commercial).
**Roads:** 25 ft / 40 ft / 60 ft (60 ft main boulevard).
**Facilities:** central mosque, schools, health centre, super shop, gym, coffee shop, walking trails, green open spaces, children's play area, 24/7 security.
**Payment:** immediate registration on full payment; installments up to 5 years.
**Progress:** ~40% of land already acquired.
**Distances:** Dhaka 22 km · Dhaka–Mawa Expressway 1.5 km · Padma Bridge 12 km · Keraniganj 6 km · Airport 30–35 min.
**Boundaries:** W = KC Road · E = Dhaleshwari River + embankment road · N = Sayedpur Para · S = Nimtali.
**Taglines:** "Where Your Dream Finds Its Address" · "Building Landmark, Creating Legacy".

### 🔴 Confirm with owner before launch (do not guess)
- **RAJUK:** project does **not** require RAJUK approval → **no RAJUK badge/claim** on the site. REHAB membership not yet held → no REHAB logo.
- **Legal entity name:** source doc says "South Dhaka Land Development Ltd."; brochure says "South Dhaka Properties & Housing Ltd." — confirm the registered name for the footer/legal line.
- **Phone:** source doc shows `01862534626`; brochure says "to be updated" — confirm the live sales number before wiring `tel:`/`wa.me`.
- **Email:** `contact.southcity2020@gmail.com` vs `info@southdhaka.com.bd` — pick the public one.
- **Office address:** confirm exact (Rahman Chamber/Mansion, Motijheel).
- **Plot prices:** provide real ৳ figures per Katha, or use "Call for price".

---

## 11. Build Order (do in this sequence)

1. **Scaffold:** `npm create astro@latest` (minimal), add Tailwind (`npx astro add tailwind`), add Astro i18n config (bn default, en). Commit to a new GitHub repo.
2. **Brand base:** put color tokens in `tailwind.config`, load fonts, build header + hero + sticky bar + floating WhatsApp → prove the conversion path first.
3. **Trust row + project-facts block** → the persuasion core.
4. **Master plan hotspots + plot-size tabs** → the product.
5. **Location (lazy map) + distance chart + landmark tabs + amenities grid + gallery.**
6. **Lead form (Web3Forms + WhatsApp) + footer.**
7. **Bilingual pass:** move all copy into `{en,bn}` dictionaries/content; test toggle everywhere.
8. **CMS (Sanity):** define schemas, connect content, set deploy webhook.
9. **Performance + QA:** WebP conversion, lazy-load audit, Lighthouse ≥ 90, real-device call/WhatsApp test.
10. **Deploy** (Section 12).

Ship section-by-section; each is independently testable.

### Suggested folder structure
```
/
├─ public/            # favicons, static og-image, robots.txt
├─ src/
│  ├─ components/     # Header, Hero, TrustRow, Facts, MasterPlan,
│  │                  # PlotTabs, Location, Landmarks, Amenities,
│  │                  # Gallery, LeadForm, Footer, StickyBar, LangToggle
│  ├─ layouts/        # BaseLayout.astro (head, fonts, lang)
│  ├─ content/        # bn/ and en/ content (or Sanity client)
│  ├─ i18n/           # ui strings dictionary
│  ├─ assets/         # source images (Astro optimizes)
│  └─ pages/
│     ├─ index.astro         # bn (default)
│     └─ en/index.astro      # en
├─ sanity/            # Sanity studio + schemas (if used)
├─ tailwind.config.mjs
└─ astro.config.mjs
```

---

## 12. Deployment (GitHub → Cloudflare Pages → domain)

1. Push repo to GitHub.
2. Cloudflare dashboard → **Pages** → Connect to GitHub → select repo. Framework preset: **Astro**. Build command `npm run build`, output dir `dist`.
3. First deploy gives a `*.pages.dev` URL — test on a real phone.
4. **Domain:** buy `southcity.com.bd` (via BTCL) or a `.com` (Namecheap/Cloudflare). In Cloudflare Pages → Custom domains → add it; set DNS. HTTPS is automatic.
5. **Sanity webhook:** Sanity → API → Webhooks → add Cloudflare Pages "Deploy hook" URL so Publish rebuilds the site.
6. Add GA4 + Meta Pixel IDs. Submit sitemap to Google Search Console.

**Commands cheat-sheet**
```bash
npm create astro@latest        # scaffold
npx astro add tailwind         # styling
npm run dev                    # local preview (localhost:4321)
npm run build && npm run preview   # production build test
```

---

## 13. Pre-Launch Checklist

- [ ] §10 🔴 items confirmed (name, phone, email, address, prices).
- [ ] No RAJUK / REHAB badge anywhere.
- [ ] `tel:` + `wa.me` tested on a real phone (both open correctly).
- [ ] Bangla **and** English proof-read by a native reader (hero, CTA, form).
- [ ] Katha/BDT formatting correct (lakh grouping, ৳ sign).
- [ ] All images WebP + lazy-loaded; none over budget.
- [ ] Sticky bar doesn't cover footer/form.
- [ ] Lighthouse mobile ≥ 90; LCP < 2.5s on throttled 4G.
- [ ] Favicon + Open Graph image (SD emblem) → nice WhatsApp/FB share preview.
- [ ] Google Map lazy-loads (not requested until in view).
- [ ] CMS: owner can edit a text, swap an image, and upload a new brochure PDF, then see it live after publish.
- [ ] Sanity images are build-time optimized through Astro `<Image>` (served by Cloudflare), NOT hotlinked from Sanity's CDN (keeps Sanity bandwidth ~0).
- [ ] Form submission arrives in sales inbox (test end-to-end).

---

*Prepared as a build-ready specification for Claude Code (Fable 5). All trust/legal claims are constrained to what the project's own documents verify — resolve the §10 🔴 items with the owner before final copy.*
