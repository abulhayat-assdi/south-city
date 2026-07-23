# 🔴 Placeholders to confirm before launch

Everything below is a stand-in for a spec §21 item the owner had not yet confirmed.
Most are **editable from the admin panel** — no code change and no redeploy needed.

---

## 1. Company contact & identity — edit in **Admin → Content**

Stored in the `CompanyProfile` row; seeded by `prisma/seed.ts` (lines ~181–188).

| Item | Placeholder used | Appears on |
|---|---|---|
| Phone | `+8801862534626` | Header "Call now", sticky mobile bar, footer, contact page, **money receipts** |
| Email | `info@southdhaka.com.bd` | Footer, contact page |
| Office address | `Rahman Chamber, Motijheel C/A, Dhaka-1000` (EN + BN) | Footer, contact page, **money receipts** |
| WhatsApp number | `8801862534626` (also `NEXT_PUBLIC_WHATSAPP` in `.env`) | Every WhatsApp button + floating FAB |
| Facebook / YouTube / LinkedIn | bare `facebook.com` / `youtube.com` / `linkedin.com` | Footer social icons |

> The address and phone are printed on every **money receipt PDF**, so confirm these first.

## 2. Chairman & MD — edit in **Admin → Content → চেয়ারম্যান/এমডি**

| Item | Placeholder | Note |
|---|---|---|
| Chairman's name | literally `"Chairman"` | Real name pending |
| MD's name | literally `"Managing Director"` | Real name pending |
| Both messages | Drafted text based on the brochure | Replace with the client's own wording |
| Both photos | none (empty box renders) | Upload and set the photo URL |

## 3. South City project — edit in **Admin → Projects → South City**

| Item | Placeholder | Where |
|---|---|---|
| **Plot prices** | `null` → renders **"Call for price" / "মূল্যের জন্য কল করুন"** | `plotTypes` JSON |
| Plot dimensions | `36×60`, `50×72`, `72×100 ft` — derived from the Katha areas | `plotTypes` JSON — confirm the real dimensions |
| Google Map pin | search query `Sayedpur, South Keraniganj, Dhaka` | `mapEmbedUrl` — replace with an exact plus-code/coordinates for a precise pin |
| Brochure PDF | `null` — the Download Brochure button is hidden until set | `brochureUrl` |
| Project logo | falls back to the company SD logo | `logoUrl` — set South City's own logo |
| Indicative plot `basePrice` | `sizeKatha × 1,200,000` on the 32 seeded plots | Internal/indicative only — never shown publicly. The real price is negotiated per sale. |
| Landmark items | "Planned within South City" / "Within 6 km" — conservative phrasings | `landmarks` JSON — refine with real named schools/hospitals/bazaars |

## 4. Installment policy — **in code**, one place

`src/server/services/payments.ts` — the comment block at the top of the file.

Current default (spec §21 was unconfirmed):

- **No late fee**
- **No grace period** — an unpaid installment is OVERDUE the day after its due date
- **Cancellation releases the plot** back to AVAILABLE; refunds are handled offline

Changing the policy means changing that file (and adding tests in `payments.test.ts`).

## 5. Money receipt format — **in code**

`src/server/pdf/receipt.tsx`. Currently: company header (name/address/phone from
CompanyProfile), receipt serial `RCP-<year>-<6 digits>`, customer + project/plot + sale ref,
amount, and two signature lines ("Received by" / "Authorized signature").
Confirm the layout, then adjust that component.

## 6. Domain & environment — `.env`

| Item | Placeholder |
|---|---|
| Domain | `southdhaka.com.bd` (assumed) — set in `Caddyfile`, `AUTH_URL`, `NEXT_PUBLIC_SITE_URL` |
| `AUTH_SECRET` | `change-me-…` — **must** be replaced: `openssl rand -base64 32` |
| `POSTGRES_PASSWORD` | `change-me-strong-password` — **must** be replaced |
| Seeded admin password | `ChangeMe#2026` — forced change on first login, but set a real one via `SEED_ADMIN_PASSWORD` |

## 7. Media

South City images are real and in place (`public/projects/south-city/` — hero, 6 gallery
images, master plan, 4 landmark images). The company **SD logo** (`public/brand/sd-logo.svg`)
is a generated wordmark — swap it for the real logo export.

---

## Non-negotiable (spec §21)

- ❌ **No "RAJUK Approved" badge** — the company does not hold it.
- ❌ **No REHAB logo** — the company is not a member.

Neither appears anywhere in the codebase. Do not add them.

Also confirm before launch: the Bangla copy should be proof-read by a native reader, and
the `tel:` / `wa.me` links tested on a real phone.
