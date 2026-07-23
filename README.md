# South Dhaka Properties & Housing Ltd.

One Next.js application containing:

1. **Public bilingual company website** (বাংলা default at `/`, English at `/en`)
2. **Multi-project admin/staff ERP** — projects, plots, customers, sales, installments, manual payment recording, documents, reports
3. **Customer portal** — one login shows a customer's plots across every project

**South City** is the first *project* inside the company. More projects (e.g. North City)
are added purely from **Admin → Projects** — no code changes needed.

Built to `South_Dhaka_Company_ERP_BUILD_INSTRUCTIONS.md` (the spec; section refs below point to it).

---

## Stack (spec §3)

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router, TypeScript), `output: 'standalone'` |
| UI | Tailwind CSS + shadcn/ui-style components |
| Database | PostgreSQL 16 + Prisma |
| Auth | Auth.js (NextAuth v5), Credentials, roles ADMIN / STAFF / CUSTOMER |
| Money | Prisma `Decimal(14,2)`, computed as integer **poisha** (`bigint`) — never Float |
| PDF | `@react-pdf/renderer` (money receipts) |
| Hosting | Hostinger VPS — Docker Compose: app + Postgres + Caddy (auto-TLS) |

---

## Run it locally

```bash
npm install
cp .env.example .env          # then edit the secrets

npm run db:up                 # starts Postgres 16 in Docker on localhost:5433
npm run prisma:migrate        # create/apply the schema
npm run seed                  # company profile, leaders, South City, 32 plots, first ADMIN

npm run dev                   # http://localhost:3000
```

Other commands:

```bash
npm run test         # vitest — installment & payment math (28 tests)
npm run typecheck    # tsc --noEmit
npm run build        # production build
npm run prisma:studio
npm run db:down
```

### Seeded logins

Both are created with `mustChangePassword=true` — you are forced to set a new password on first login.

| Role | Email | Temp password |
|---|---|---|
| ADMIN | `admin@southdhaka.com.bd` | `ChangeMe#2026` |
| STAFF | `staff@southdhaka.com.bd` | `Staff#2026` |

Override the admin values with `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` in `.env`.
A CUSTOMER login is not seeded — create one from **Admin → Customers → [customer] → Create login account**.

---

## Routes

**Public** (bn default; every path also exists under `/en`)

`/` · `/about` · `/message/chairman` · `/message/md` · `/projects` · `/projects/[slug]` · `/news` · `/news/[slug]` · `/contact`

**Admin / ERP** (`ADMIN`, `STAFF`) — `/admin`

Dashboard · Projects · Plots · Customers · Sales · Payments · Reports · Content\* · Users\* · Audit log\*  (\* = ADMIN only)

**Customer portal** (`CUSTOMER`) — `/portal`, `/portal/sales/[id]`

**Auth** — `/login`, `/change-password`

---

## How the money works (spec §4, §11)

- All amounts are `Decimal(14,2)` in the DB. **All arithmetic happens in integer poisha (`bigint`)** via `src/lib/money.ts`, so there is never a floating-point rounding error.
- Schedule generation (`src/server/services/installments.ts`):
  ```
  financed          = salePrice − downPayment
  perInstallment    = round(financed / n, 2)
  amountDue[1..n-1] = perInstallment
  amountDue[n]      = financed − perInstallment×(n−1)   // last absorbs rounding
  ```
  The schedule total therefore equals `salePrice − downPayment` **exactly**.
- Payments are **recorded, never deleted**. An ADMIN voids with a reason; voided payments are excluded from every total, report and receipt.
- After any payment change, `recomputeSale()` (`src/server/services/payments.ts`) re-derives everything from the non-voided payments: it re-allocates the paid total oldest-installment-first, recomputes each installment's status (PAID / PARTIAL / OVERDUE / PENDING), and rolls the Sale up to COMPLETED + the Plot to SOLD once fully paid.
- Advance/partial payments are handled by the same allocation pass, so an overpayment automatically flows into the next installments.

**The installment policy lives in one place** — the comment block at the top of
`src/server/services/payments.ts`. The current default (spec §21 unconfirmed):
**no late fee, no grace period, cancellation releases the plot back to AVAILABLE**
(refunds are handled offline). Change it there.

---

## Security (spec §14)

- RBAC is enforced **server-side on every query and mutation** (`src/lib/rbac.ts`, `src/server/session.ts`) — the UI hiding a button is never the control.
- A CUSTOMER can only ever load rows where `sale.customerId === session.customerId`; `/portal/sales/[id]` and `/api/receipts/[id]` both re-check ownership, so changing an ID in the URL returns 404/403.
- STAFF cannot void payments, manage users, or edit company content.
- Passwords: bcrypt cost 12. Login is rate-limited and locks for 15 min after 5 failures.
- Documents and receipt PDFs are served **only** through auth-checked routes (`/api/documents/[id]`, `/api/receipts/[id]`) — never from a public directory.
- Every create/update/void of Sale, Payment, Customer, Plot, Project and User writes an `AuditLog` row inside the same transaction.
- Postgres is **not published** to the host in production — it is reachable only on the internal Docker network.

---

## Deploy to the Hostinger VPS (spec §16)

On the VPS (Ubuntu 24.04, KVM 2 recommended) — harden first: create a `deploy` sudo user,
SSH keys only (`PermitRootLogin no`, `PasswordAuthentication no`), `ufw allow OpenSSH 80 443 && ufw enable`,
install `fail2ban`, enable unattended security updates.

```bash
curl -fsSL https://get.docker.com | sh          # install Docker

git clone <repo> southdhaka && cd southdhaka
cp .env.example .env                            # fill in real secrets:
                                                #   DATABASE_URL=postgresql://sdph:<pw>@db:5432/sdph
                                                #   AUTH_SECRET=$(openssl rand -base64 32)
                                                #   AUTH_URL=https://southdhaka.com.bd
                                                #   POSTGRES_PASSWORD=<strong>

docker compose up -d --build
docker compose exec app npx prisma migrate deploy
docker compose exec app npm run seed             # first ADMIN + company + South City
```

Point the domain A record (`southdhaka.com.bd`, `www`) → the VPS IP; Caddy issues and renews TLS automatically.

Then add the nightly backup cron (spec §15):

```bash
chmod +x scripts/backup.sh
crontab -e     #  0 2 * * *  /opt/southdhaka/scripts/backup.sh >> /var/log/sdph-backup.log 2>&1
```

`scripts/backup.sh` dumps the DB **and** the uploads volume. **Copy the backups off the VPS
and test a restore before go-live.**

> If the VPS is short on RAM (KVM 1), build the image in CI and push it rather than
> running `--build` on the server.

---

## Adding a second project (e.g. North City)

No code changes. **Admin → Projects → New project**: set the slug, name, hero/master-plan
image URLs, the at-a-glance text, and the structured JSON blocks (amenities, trust items,
plot types, landmarks, distances, boundaries — copy South City's shapes from `prisma/seed.ts`).
Publish it, then add plots under **Plots** (or CSV import, which asks which project to import into).
The new project immediately appears on `/projects`, gets its own `/projects/<slug>` page, and
shows up in the admin project switcher and every report filter.

---

## Notes

- Public pages render on demand but their data is **cached for 5 minutes** (`src/server/public-data.ts`), which is the practical equivalent of ISR. We cache the data instead of prerendering the pages because the production image is built with `docker build`, where Postgres is not reachable — prerendering would fail the build. Saving content in the admin flushes the cache immediately.
- `src/middleware.ts` triggers a Next 16 deprecation warning (the convention is being renamed to `proxy`). It still works; rename when upgrading.
- 🔴 **No RAJUK badge and no REHAB logo appear anywhere** — the company holds neither (spec §21). Do not add them.
- See `PLACEHOLDERS.md` for every unconfirmed value and exactly where to change it.
