# South City — Landing Page

Fast, mobile-first, bilingual (বাংলা default / English) single-project landing page
for **South City** — a planned residential & commercial land development in
Sayedpur, South Keraniganj, Dhaka, by South Dhaka Properties & Housing Ltd.

Built per `South_City_BUILD_INSTRUCTIONS.md` (the project spec).

## Stack

| Layer | Choice |
|---|---|
| Framework | Astro (static output, near-zero JS) |
| Styling | Tailwind CSS (brand tokens in `tailwind.config.mjs`) |
| CMS | Sanity (optional at build — site falls back to local content) |
| Leads | Web3Forms (email) + WhatsApp deep links — no database |
| Hosting | Cloudflare Pages (free tier) |

## Commands

```bash
npm install          # once
npm run dev          # local dev → http://localhost:4321
npm run build        # production build → dist/
npm run preview      # serve the production build locally
npm run assets       # regenerate placeholder images/favicons/PDF (rarely needed)
```

## Routes

- `/` — বাংলা (default language)
- `/en/` — English
- `/brochure/south-city-brochure.pdf` — brochure download (emitted at build;
  pulls the owner-uploaded PDF from Sanity when configured, else the local placeholder)

## Content model

- **All visitor copy** lives in `{ en, bn }` objects:
  - UI strings → `src/i18n/ui.ts`
  - Site data (facts, plots, amenities, contacts…) → `src/content/site.ts`
- `src/content/index.ts` merges optional **Sanity** overrides on top of the local
  defaults at build time (`src/lib/sanity.ts`). No Sanity → local content is used.
- Images: sources in `src/assets/img/`, optimized by Astro `<Image>` into `dist/`.
  Sanity-uploaded images are **downloaded and optimized at build time** — visitors
  are never served from Sanity's CDN (keeps the Sanity free tier at ~0 bandwidth).

## Setting up the CMS (Sanity) — one-time

1. `cd sanity && npm install`
2. `npx sanity init` → create a project (name it "South City"), dataset `production`.
   Put the project ID in `sanity/sanity.config.ts` (or env `SANITY_STUDIO_PROJECT_ID`).
3. `npm run dev` inside `sanity/` → open the Studio, fill in the documents
   (Site Settings, Hero, Overview, Trust Badges, Project Facts, Plots, Amenities,
   Neighborhood Tabs, Master Plan, Gallery, Brochure). Every text field has EN + বাংলা.
4. In the **site** root, set env vars (`.env` locally, and in Cloudflare Pages):
   `SANITY_PROJECT_ID=<id>`, `SANITY_DATASET=production`.
5. **Deploy webhook:** Cloudflare Pages → Settings → Builds & deployments →
   "Deploy hooks" → create one; then Sanity → sanity.io/manage → API → Webhooks →
   add that URL, trigger on publish. Publishing in the Studio now rebuilds the
   site (~1–2 min).
6. Optional: `npx sanity deploy` to host the Studio at `<name>.sanity.studio`.

> 🔴 Trust-row rule from the spec: never add a "RAJUK Approved" badge or REHAB
> logo — the project does not hold these.

## Lead form (Web3Forms) — one-time

1. Get a free access key at <https://web3forms.com> using the sales inbox address.
2. Set `PUBLIC_WEB3FORMS_KEY` in `.env` / Cloudflare Pages env vars
   (or replace the placeholder in `src/content/site.ts`).
3. Test end-to-end: submit the form, confirm the email arrives.

## Deploy (GitHub → Cloudflare Pages)

1. `git init && git add -A && git commit` → push to a new GitHub repo.
2. Cloudflare dashboard → **Workers & Pages → Create → Pages → Connect to Git** →
   select the repo. Framework preset **Astro**, build command `npm run build`,
   output `dist`. Add the env vars above.
3. First deploy gives `*.pages.dev` — test call/WhatsApp buttons on a real phone.
4. Custom domain: Pages → Custom domains (e.g. `southcity.com.bd` via BTCL).
5. Update `site` in `astro.config.mjs` + `public/robots.txt` to the real domain.
6. Add GA4 / Meta Pixel snippets in `src/layouts/BaseLayout.astro` (placeholder
   comment marks the spot) — `call_click` / `whatsapp_click` / `form_submit`
   events fire automatically once `gtag`/`fbq` exist.

## Pre-launch checklist (from spec §13)

- [ ] Replace every 🔴 placeholder (see PLACEHOLDERS.md) — phone, email, address,
      legal name, prices, social URLs, Web3Forms key, real images & brochure.
- [ ] No RAJUK / REHAB claims anywhere (already enforced).
- [ ] `tel:` + `wa.me` tested on a real phone.
- [ ] Bangla & English proof-read by a native reader.
- [ ] Form submission arrives in the sales inbox.
- [ ] Lighthouse mobile ≥ 90 on the deployed URL.
