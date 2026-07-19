# South City — Web App + ERP Build Instructions (v3)

**For:** Claude Code (Fable 5) — build this project.
**Client:** South Dhaka Properties & Housing Ltd. — project "South City".
**Deliverable:** One Next.js application containing (1) the public bilingual marketing site, (2) a customer portal, and (3) an admin/staff ERP for land sales, customers, pricing and installment tracking.

> ⚠️ **This document supersedes the earlier static-site spec (v2).** The project scope changed from a marketing landing page to a full business application. The existing Astro marketing page is to be **ported into this Next.js app**, keeping its design, brand and bilingual content.

---

## 🧭 কীভাবে ব্যবহার করবেন (for the owner)

এই ফাইলটা Claude Code (Fable 5)-কে দিন। এটাই পুরো অ্যাপের ব্লুপ্রিন্ট — ডেটাবেজ স্ট্রাকচার, অ্যাডমিন প্যানেল, কাস্টমার পোর্টাল, ইনস্টলমেন্ট হিসাব, নিরাপত্তা, আর Hostinger VPS-এ ডিপ্লয় — সব এখানে আছে। §18-এর build order অনুযায়ী কাজ করতে বলুন।

**গুরুত্বপূর্ণ:** এই সিস্টেম **শুধু অফলাইনে নেওয়া টাকার হিসাব রেকর্ড করে** — এটা নিজে কোনো টাকা লেনদেন বা ট্রান্সফার করে না। কোনো পেমেন্ট গেটওয়ে নেই।

---

## 1. Goal & Scope

Replace the client's paper-based land-sales record keeping with a single web system that also markets the project.

**In scope**
- Public bilingual (বাংলা/English) marketing site for South City.
- Admin/staff ERP: customers, plot inventory, sales, per-customer pricing, installment schedules, manual payment recording, documents, reports.
- Customer portal: each buyer logs in to see their plot, installment schedule, payment history and documents.
- Digital purchase form replacing the hard-copy buyer information sheet.

**Out of scope (for now)**
- Online payment gateway (bKash/Nagad/card). Payments are recorded manually by staff.
- Public self-registration. Admin creates customer accounts.

---

## 2. Architecture

One Next.js app, three areas, one PostgreSQL database:

```
southcity-app/
├─ /                 → Public marketing site (bn default, /en English)
├─ /portal           → Customer area  (role: CUSTOMER)
└─ /admin            → ERP dashboard  (roles: ADMIN, STAFF)
```

- Public pages: statically rendered / ISR for speed.
- Portal & admin: server-rendered, auth-protected, dynamic.
- All business logic runs server-side (Server Actions / Route Handlers). **Never trust the client for authorization or money calculations.**

---

## 3. Tech Stack (final)

| Layer | Choice | Notes |
|---|---|---|
| **Framework** | **Next.js 15+ (App Router, TypeScript)** | Public site + portal + admin + server logic in one codebase. |
| **UI** | **Tailwind CSS + shadcn/ui** | shadcn gives ready tables, forms, dialogs, toasts for the admin panel. Keep South City brand colors. |
| **Database** | **PostgreSQL 16** | Relational — correct for customers ↔ plots ↔ sales ↔ installments ↔ payments. |
| **ORM** | **Prisma** | Type-safe queries + migrations. |
| **Auth** | **Auth.js (NextAuth v5)** — Credentials provider | Role-based (ADMIN / STAFF / CUSTOMER). Admin creates all accounts. |
| **Validation** | **Zod** + React Hook Form | Validate on the server too, always. |
| **Money** | **Prisma `Decimal`** | **Never use Float for money.** All amounts in BDT. |
| **File storage** | VPS volume (`/var/southcity/uploads`) served via app route | Documents (NID, deed, receipts). Optional: Cloudflare R2 for offsite durability. |
| **PDF receipts** | `@react-pdf/renderer` or `pdfkit` | Money receipts + installment schedule printouts. |
| **Charts** | `recharts` | Admin dashboard KPIs. |
| **i18n** | `next-intl` | Public site bn/en. Admin panel: Bangla labels with English field names is fine. |
| **Hosting** | **Hostinger VPS (Ubuntu 24.04)** | Docker Compose: app + PostgreSQL + Caddy (TLS). See §15. |

**Recommended VPS plan:** Hostinger **KVM 2** (2 vCPU, 8 GB RAM, 100 GB NVMe) — comfortable for Next.js build + Postgres. KVM 1 (1 vCPU, 4 GB) is the workable minimum but build the Docker image locally/CI rather than on the server.

> **CMS note:** Sanity is dropped. The admin panel itself now edits the public site's text, images and brochure PDF (see §6.7) — one system for the owner to learn.

---

## 4. Data Model (Prisma schema)

Create `prisma/schema.prisma` along these lines. Adjust names as needed but keep the relationships and the money/audit rules.

```prisma
generator client { provider = "prisma-client-js" }
datasource db { provider = "postgresql"; url = env("DATABASE_URL") }

enum Role              { ADMIN STAFF CUSTOMER }
enum PlotStatus        { AVAILABLE RESERVED BOOKED SOLD }
enum PlotCategory      { RESIDENTIAL COMMERCIAL }
enum PaymentType       { FULL INSTALLMENT }
enum SaleStatus        { ACTIVE COMPLETED CANCELLED }
enum InstallmentStatus { PENDING PARTIAL PAID OVERDUE }
enum PaymentMethod     { CASH BANK_TRANSFER CHEQUE BKASH NAGAD OTHER }
enum DocumentType      { NID PHOTO SIGNATURE AGREEMENT DEED MONEY_RECEIPT OTHER }

model User {
  id            String    @id @default(cuid())
  name          String
  email         String    @unique
  phone         String?
  passwordHash  String
  role          Role      @default(CUSTOMER)
  isActive      Boolean   @default(true)
  mustChangePassword Boolean @default(true)   // admin-created accounts
  lastLoginAt   DateTime?
  customer      Customer?
  payments      Payment[]  @relation("RecordedBy")
  auditLogs     AuditLog[]
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

model Customer {
  id             String   @id @default(cuid())
  customerCode   String   @unique          // e.g. SC-0001
  userId         String?  @unique          // login account (created by admin)
  user           User?    @relation(fields: [userId], references: [id])

  // --- data from the hard-copy purchase form (§8) ---
  fullNameEn     String
  fullNameBn     String?
  fatherName     String?
  motherName     String?
  spouseName     String?
  nidNumber      String?
  dateOfBirth    DateTime?
  occupation     String?
  nationality    String?  @default("Bangladeshi")
  phonePrimary   String
  phoneSecondary String?
  email          String?
  presentAddress    String?
  permanentAddress  String?

  // nominee
  nomineeName     String?
  nomineeRelation String?
  nomineeNid      String?
  nomineePhone    String?
  nomineeAddress  String?

  photoUrl       String?
  signatureUrl   String?
  notes          String?

  sales          Sale[]
  documents      Document[]
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
}

model Plot {
  id           String       @id @default(cuid())
  sector       String                        // A | B | C | D
  plotNumber   String
  sizeKatha    Decimal      @db.Decimal(6,2) // 3, 5, 10
  category     PlotCategory @default(RESIDENTIAL)
  roadWidthFt  Int?                          // 25 | 40 | 60
  dimensions   String?                       // e.g. "40ft x 45ft"
  faceDirection String?
  status       PlotStatus   @default(AVAILABLE)
  basePrice    Decimal?     @db.Decimal(14,2) // indicative; actual price is per-sale
  remarks      String?
  sales        Sale[]
  createdAt    DateTime     @default(now())
  updatedAt    DateTime     @updatedAt
  @@unique([sector, plotNumber])
  @@index([status, sizeKatha, sector])
}

model Sale {
  id                 String      @id @default(cuid())
  saleCode           String      @unique      // e.g. SALE-2026-0001
  plotId             String
  plot               Plot        @relation(fields: [plotId], references: [id])
  customerId         String
  customer           Customer    @relation(fields: [customerId], references: [id])

  salePrice          Decimal     @db.Decimal(14,2)  // negotiated per customer
  downPayment        Decimal     @db.Decimal(14,2) @default(0)
  paymentType        PaymentType
  installmentCount   Int?                            // e.g. 60 months
  installmentStartDate DateTime?
  bookingDate        DateTime
  status             SaleStatus  @default(ACTIVE)
  notes              String?

  installments       Installment[]
  payments           Payment[]
  documents          Document[]
  createdById        String
  createdAt          DateTime    @default(now())
  updatedAt          DateTime    @updatedAt
  @@index([customerId, status])
}

model Installment {
  id            String            @id @default(cuid())
  saleId        String
  sale          Sale              @relation(fields: [saleId], references: [id], onDelete: Cascade)
  installmentNo Int
  dueDate       DateTime
  amountDue     Decimal           @db.Decimal(14,2)
  amountPaid    Decimal           @db.Decimal(14,2) @default(0)
  status        InstallmentStatus @default(PENDING)
  payments      Payment[]
  @@unique([saleId, installmentNo])
  @@index([dueDate, status])
}

model Payment {
  id            String        @id @default(cuid())
  receiptNo     String        @unique          // e.g. RCP-2026-000123
  saleId        String
  sale          Sale          @relation(fields: [saleId], references: [id])
  installmentId String?
  installment   Installment?  @relation(fields: [installmentId], references: [id])
  amount        Decimal       @db.Decimal(14,2)
  paymentDate   DateTime
  method        PaymentMethod
  referenceNo   String?                        // cheque/trx id
  note          String?

  // payments are never hard-deleted — void with a reason instead
  isVoided      Boolean       @default(false)
  voidReason    String?
  voidedAt      DateTime?

  recordedById  String
  recordedBy    User          @relation("RecordedBy", fields: [recordedById], references: [id])
  createdAt     DateTime      @default(now())
  @@index([saleId, paymentDate])
}

model Document {
  id           String       @id @default(cuid())
  type         DocumentType
  fileUrl      String
  fileName     String
  mimeType     String?
  sizeBytes    Int?
  customerId   String?
  customer     Customer?    @relation(fields: [customerId], references: [id])
  saleId       String?
  sale         Sale?        @relation(fields: [saleId], references: [id])
  uploadedById String
  createdAt    DateTime     @default(now())
}

model AuditLog {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  action    String            // CREATE_SALE, RECORD_PAYMENT, VOID_PAYMENT, ...
  entity    String            // Sale, Payment, Customer, Plot
  entityId  String
  before    Json?
  after     Json?
  ipAddress String?
  createdAt DateTime @default(now())
  @@index([entity, entityId])
}

// --- public site content, editable from admin (replaces the CMS) ---
model SiteSetting {
  key       String   @id          // hero.title, contact.phone, brochure.pdf ...
  valueEn   String?
  valueBn   String?
  updatedAt DateTime @updatedAt
}

model MediaAsset {
  id        String   @id @default(cuid())
  url       String
  fileName  String
  altEn     String?
  altBn     String?
  createdAt DateTime @default(now())
}
```

**Money rules (enforce everywhere):**
- All amounts are `Decimal(14,2)` BDT. Never Float.
- `Installment.amountPaid` and `status` are derived from non-voided `Payment` rows — recompute, don't trust stale values.
- Rounding: when generating a schedule, the **last installment absorbs the remainder** so the total exactly equals `salePrice − downPayment`.

---

## 5. Roles & Auth

| Role | Can do |
|---|---|
| **ADMIN** | Everything: users, customers, plots, sales, payments, void payments, site content, reports. |
| **STAFF** | Create/edit customers, plots, sales; record payments. **Cannot** void payments, manage users, or change site content. |
| **CUSTOMER** | Read-only view of *their own* sales, installments, payments, documents. |

- **Admin creates all accounts** (no public sign-up). On creation, generate a temporary password, set `mustChangePassword = true`, and show it once to the admin to hand over.
- Hash passwords with **argon2** (or bcrypt cost ≥ 12).
- Protect routes with Next.js middleware **and** re-check the role inside every server action/route handler.
- A CUSTOMER must only ever load rows where `sale.customerId === session.customerId`. Enforce in the query, not the UI.
- Rate-limit login attempts; lock the account temporarily after repeated failures.

---

## 6. Admin Panel (`/admin`)

### 6.1 Dashboard
KPI cards + charts: total plots by status (Available / Reserved / Booked / Sold), plots sold this month, **collection this month (BDT)**, **total outstanding dues**, overdue installment count, recent payments feed.

### 6.2 Plot inventory
- Table with filters: **sector (A–D)**, **size (3 / 5 / 10 Katha)**, category, status. Search by plot number.
- Create / edit / bulk-import plots (CSV import helpful for 500 bigha of inventory).
- Plot detail shows current owner (if sold) and full sale history.

### 6.3 Customers
- Table with search (name, phone, NID, customer code) and filters: **plot size owned**, sector, payment status (up-to-date / overdue), sale status.
- Customer detail page: profile, their plot(s), sale terms, installment schedule, payment history, documents, and a **"Create login account"** button.
- Full CRUD; every change written to `AuditLog`.

### 6.4 Sales / bookings
- "New Sale" flow: pick customer → pick an AVAILABLE plot → enter **negotiated sale price** → choose FULL or INSTALLMENT → if installment: down payment, number of months, start date → preview the generated schedule → confirm.
- On confirm: create Sale + Installments, set plot status to BOOKED (or SOLD when fully paid), write AuditLog.
- Edit terms (with audit trail); cancel a sale (releases the plot back to AVAILABLE).

### 6.5 Installments & payment recording ⭐ core
- Sale detail shows the full schedule: No, Due date, Amount due, Paid, Balance, Status.
- **"Record Payment"**: choose installment (or "general payment"), amount, date, method (Cash / Bank / Cheque / bKash / Nagad / Other), reference no, note → saves a `Payment`, recalculates the installment status, generates a **receipt number**, and offers a **printable/downloadable PDF money receipt**.
- Support **partial payments** and **advance payments** — allocate to the oldest unpaid installment first, carry any surplus forward.
- Mark installments **OVERDUE** automatically (nightly job or computed at read time) when `dueDate < today` and not fully paid.
- Payments are **never deleted** — ADMIN can **void** with a reason (kept in the table, excluded from totals, recorded in AuditLog).

### 6.6 Documents
Upload per customer/sale: NID, photo, signature, agreement, deed, receipts. Store on the VPS volume; save metadata in `Document`. Restrict access — only ADMIN/STAFF and the owning customer may fetch a file (serve through an auth-checked route, never a public directory listing).

### 6.7 Site content (replaces the CMS)
Simple admin screens to edit the public marketing site without code:
- Hero title/subtitle (bn+en), overview text, counters, trust badges, amenities labels, landmark distances, contact phone/email/address, social links.
- **Media library**: upload/replace images used on the public pages.
- **Brochure PDF**: upload/replace the downloadable brochure.
- After save, revalidate the affected public pages (`revalidatePath` / ISR).

### 6.8 Users & settings
ADMIN only: create staff/admin accounts, deactivate users, reset passwords, view AuditLog.

---

## 7. Customer Portal (`/portal`)

- Login with admin-issued credentials; force password change on first login.
- **My Plot**: sector, plot no, size (Katha), category, road width, booking date.
- **My Payments**: total price, paid to date, outstanding balance, next due date & amount, full installment schedule with status, payment history with downloadable receipts.
- **My Documents**: view/download their own documents.
- **Profile**: view details; request corrections (edits go to admin, not self-serve, to protect record integrity).
- Fully mobile-responsive — most customers will open this on a phone.

---

## 8. Digital Purchase Form (hard copy → soft copy)

A multi-step form in admin (also printable as PDF for signature) capturing everything the paper form does:

1. **Buyer**: full name (English + Bangla), father's, mother's, spouse's name, NID no, date of birth, occupation, nationality, phone (primary/secondary), email.
2. **Addresses**: present and permanent.
3. **Nominee**: name, relation, NID, phone, address.
4. **Plot & terms**: sector, plot no, size in Katha, category, **agreed sale price (BDT)**, down payment, full payment or installment, number of months, start date.
5. **Attachments**: buyer photo, signature, NID copy — upload.
6. **Review & submit** → creates Customer (if new) + Sale + installment schedule in one transaction.

Validate with Zod (phone format `01XXXXXXXXX`, NID digits, required fields). Save drafts so a long form isn't lost.

---

## 9. Installment Engine (rules)

```
financed        = salePrice − downPayment
perInstallment  = round(financed / installmentCount, 2)
schedule[i].amountDue = perInstallment           (i = 1 … n−1)
schedule[n].amountDue = financed − perInstallment × (n−1)   // absorbs rounding
schedule[i].dueDate   = installmentStartDate + i months
```

- Recompute `Installment.amountPaid` = Σ non-voided payments allocated to it.
- Status: `PAID` if amountPaid ≥ amountDue; `PARTIAL` if 0 < amountPaid < amountDue; `OVERDUE` if unpaid/partial and past due; else `PENDING`.
- Sale becomes `COMPLETED` and plot becomes `SOLD` when total non-voided payments ≥ salePrice.
- Write every payment/void to `AuditLog` with the acting user.

---

## 10. Reports & Filters

- **Who bought what** — sales list filterable by **plot size (3/5/10 Katha)**, sector, date range, staff, payment type.
- **Dues report** — outstanding balance per customer, sorted by amount or by days overdue.
- **Collection report** — payments in a date range, grouped by method/staff; monthly totals.
- **Overdue list** — customers with an installment past due (for follow-up calls).
- **Inventory report** — plots by status and size.
- Every report **exportable to CSV** and printable.

---

## 11. Public Marketing Site (port from the existing build)

Keep the existing design and content — port the Astro components to Next.js React components. Sections: sticky header, hero, trust row, project at a glance, master plan with sector hotspots, plot-size tabs (3/5/10 Katha), location (lazy-loaded Google Map + distance chart), landmark tabs, amenities grid, gallery, lead form, footer, sticky mobile Call/WhatsApp bar, floating WhatsApp button.

- Brand: navy `#14245C`, deep navy `#0E1A44`, gold `#C9A227`, WhatsApp green `#25D366`, white bg, soft `#F6F7FA`.
- Fonts: Poppins/Inter (Latin) + Hind Siliguri / Noto Sans Bengali (Bangla); `[lang="bn"] { line-height: 1.75 }`.
- Images via `next/image` (WebP, lazy below fold, hero preloaded). Existing images live in `south-city-images/`.
- **Public lead form** → saves an enquiry row **and** offers a WhatsApp deep link. (Enquiries are separate from Customers; admin can convert an enquiry into a customer.)
- 🔴 **No RAJUK badge, no REHAB logo** — the project holds neither (see §20).

---

## 12. Localization

- Public site: Bangla default, `/en` for English (`next-intl`).
- Land unit **Katha** primary (1 Katha = 720 sq ft ≈ 66.9 m²; 1 Bigha = 20 Katha).
- Currency **৳ BDT** with lakh/crore grouping: `৳ 12,50,000` — use `Intl.NumberFormat('en-IN', {style:'currency', currency:'BDT', maximumFractionDigits:0})`.
- Admin/portal: Bangla UI labels are fine; keep dates in `DD/MM/YYYY`.

---

## 13. Security & Privacy (this system holds financial + personal data)

- HTTPS everywhere (Caddy auto-TLS). Secure, httpOnly, sameSite cookies.
- Passwords: argon2/bcrypt. Never log or email plaintext passwords.
- **Server-side RBAC on every mutation and query.** A customer must never be able to fetch another customer's rows by changing an ID.
- Zod-validate all input server-side. Use Prisma (parameterized) — never raw string SQL.
- Rate-limit `/login`; lock after repeated failures; log auth events.
- Documents served only through an authenticated route with an ownership check.
- **AuditLog** every create/update/void of Sale, Payment, Customer, Plot, User.
- PostgreSQL bound to the Docker network / localhost only — **never expose port 5432 publicly**.
- VPS: SSH key auth only (disable password + root login), `ufw` allow only 22/80/443, `fail2ban`, unattended security updates.
- Keep secrets in `.env` on the server (not in git). Rotate `AUTH_SECRET` if leaked.
- Personal data (NID, photos) — restrict access to ADMIN/STAFF and the owner; don't expose in URLs or logs.

---

## 14. Backups & Recovery

- **Nightly `pg_dump`** (cron) → compressed, retain 14–30 days.
- Back up the **uploads volume** too (documents are irreplaceable).
- Copy backups **off the VPS** (Cloudflare R2 / S3 / Google Drive). A backup only on the same server is not a backup.
- Enable Hostinger's VPS snapshots as a second layer.
- **Test a restore** before go-live and document the steps.

---

## 15. Hostinger VPS — Setup & Deployment

**Plan:** KVM 2 (2 vCPU / 8 GB RAM / 100 GB NVMe) recommended; **OS: Ubuntu 24.04 LTS**.

### 15.1 Server hardening (first login)
```bash
adduser deploy && usermod -aG sudo deploy
# copy your SSH key to /home/deploy/.ssh/authorized_keys
# /etc/ssh/sshd_config: PermitRootLogin no ; PasswordAuthentication no
systemctl restart ssh
ufw allow OpenSSH && ufw allow 80 && ufw allow 443 && ufw enable
apt update && apt upgrade -y && apt install -y fail2ban
```

### 15.2 Install Docker
```bash
curl -fsSL https://get.docker.com | sh
usermod -aG docker deploy
```

### 15.3 `docker-compose.yml` (app + db + TLS proxy)
```yaml
services:
  db:
    image: postgres:16
    restart: always
    environment:
      POSTGRES_USER: southcity
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: southcity
    volumes: [pgdata:/var/lib/postgresql/data]
    # NOTE: no ports: — database is reachable only inside the Docker network

  app:
    build: .
    restart: always
    env_file: .env
    depends_on: [db]
    volumes: [uploads:/app/uploads]

  caddy:
    image: caddy:2
    restart: always
    ports: ["80:80", "443:443"]
    volumes:
      - ./Caddyfile:/etc/caddy/Caddyfile
      - caddy_data:/data
volumes: { pgdata: {}, uploads: {}, caddy_data: {} }
```

`Caddyfile` (automatic Let's Encrypt TLS):
```
southcity.com.bd, www.southcity.com.bd {
  reverse_proxy app:3000
}
```

### 15.4 Next.js Dockerfile
Use `output: 'standalone'` in `next.config.js` and a multi-stage build (deps → build → runner on `node:20-alpine`). If the VPS is tight on RAM, build the image locally or in GitHub Actions and pull it on the server.

### 15.5 Deploy & migrate
```bash
git clone <repo> && cd southcity-app
cp .env.example .env      # fill in real secrets
docker compose up -d --build
docker compose exec app npx prisma migrate deploy
docker compose exec app npm run seed   # creates the first ADMIN user
```

### 15.6 Domain & backups
- Point the domain's **A record** to the VPS IP → Caddy issues TLS automatically.
- Add the nightly backup cron (§14).
- Optional: put Cloudflare in front for CDN/DDoS on the public pages.

---

## 16. Folder Structure

```
southcity-app/
├─ prisma/            schema.prisma, migrations/, seed.ts
├─ src/
│  ├─ app/
│  │  ├─ (public)/         # marketing site (bn) + /en
│  │  ├─ portal/           # customer area
│  │  ├─ admin/            # ERP: dashboard, plots, customers, sales, payments, reports, settings
│  │  ├─ api/              # route handlers (file serving, webhooks)
│  │  └─ login/
│  ├─ components/          # ui/ (shadcn), public/, admin/
│  ├─ server/              # actions/, services/ (installments, payments, reports), auth.ts, db.ts
│  ├─ lib/                 # money.ts, katha.ts, validators (zod), rbac.ts, audit.ts
│  └─ i18n/                # bn.json, en.json
├─ uploads/                # mounted volume (documents, media)
├─ docker-compose.yml  Dockerfile  Caddyfile
└─ .env.example
```

---

## 17. Environment Variables

```
DATABASE_URL=postgresql://southcity:<pw>@db:5432/southcity
AUTH_SECRET=<openssl rand -base64 32>
AUTH_URL=https://southcity.com.bd
POSTGRES_PASSWORD=<strong password>
UPLOAD_DIR=/app/uploads
NEXT_PUBLIC_SITE_URL=https://southcity.com.bd
NEXT_PUBLIC_WHATSAPP=8801XXXXXXXXX
```

---

## 18. Build Order

1. **Scaffold**: Next.js + TS + Tailwind + shadcn/ui; brand tokens; base layout.
2. **Database**: Prisma schema (§4) → `migrate dev` → seed (admin user, 4 sectors, sample plots).
3. **Auth**: Auth.js credentials, roles, middleware, login page, force-password-change, RBAC helper.
4. **Admin shell**: sidebar layout, dashboard placeholder.
5. **Plots module**: CRUD + filters + CSV import.
6. **Customers module**: CRUD + digital purchase form (§8) + document upload + "create login".
7. **Sales module**: new-sale flow + schedule preview + generation (§9).
8. **Payments module**: record payment, allocation, statuses, void, PDF receipt. ← most important, test hard.
9. **Reports** (§10) + dashboard KPIs + CSV export.
10. **Customer portal** (§7).
11. **Public marketing site** — port existing Astro pages/design (§11) + site-content admin (§6.7).
12. **Security pass** (§13), **audit logs**, **backups** (§14).
13. **Dockerize + deploy to Hostinger VPS** (§15).
14. QA on mobile + real-device test; seed data cleanup.

Work through it end-to-end; write server-side tests for the installment/payment math.

---

## 19. Pre-Launch Checklist

- [ ] Installment math verified with real examples (incl. rounding on the last installment).
- [ ] Partial + advance payments allocate correctly; totals always equal sale price.
- [ ] Voided payments excluded from all totals and reports.
- [ ] A CUSTOMER cannot access another customer's data (test by tampering with IDs).
- [ ] STAFF cannot void payments or reach user management.
- [ ] All money stored/displayed as Decimal BDT with lakh grouping.
- [ ] Documents only downloadable by authorized users.
- [ ] AuditLog records every financial action with user + timestamp.
- [ ] Nightly DB + uploads backup running **and a restore tested**.
- [ ] Postgres not exposed publicly; ufw + fail2ban + SSH keys active; HTTPS working.
- [ ] Public site: Bangla + English proof-read, mobile responsive, Lighthouse mobile ≥ 90.
- [ ] No RAJUK / REHAB claim anywhere.
- [ ] First ADMIN account created; temp passwords changed.

---

## 20. 🔴 Confirm With the Owner Before Launch

- **RAJUK:** project does **not** require or hold RAJUK approval → no badge/claim. REHAB membership not held → no REHAB logo.
- **Legal entity name:** "South Dhaka Land Development Ltd." (source doc) vs "South Dhaka Properties & Housing Ltd." (brochure) — confirm the registered name.
- **Phone / email / office address** for the public site and receipts.
- **Plot price list** per Katha (and whether prices are shown publicly or "Call for price").
- **Receipt format**: any required company header, signature line, or serial format for money receipts.
- **Installment policy**: late fee? grace period? cancellation/refund rules? — these change the engine, so confirm before building §9.

---

## Project Data (for seeding & content)

South City — a project of South Dhaka Properties & Housing Ltd. · Sayedpur, South Keraniganj, Dhaka (beside KC Road, near Dhaka–Mawa Expressway & Eastern Bypass) · ~500 Bigha · 4 sectors (A–D) · plots 3, 5 & 10 Katha (residential + commercial) · roads 25/40/60 ft · facilities: central mosque, schools, health centre, super shop, gym, coffee shop, walking trails, green spaces, play area, 24/7 security · registration on full payment, installments up to 5 years · ~40% land acquired · distances: Dhaka 22 km, Dhaka–Mawa Expressway 1.5 km, Padma Bridge 12 km, Keraniganj 6 km, airport 30–35 min · boundaries: W = KC Road, E = Dhaleshwari River + embankment, N = Sayedpur Para, S = Nimtali · taglines: "Where Your Dream Finds Its Address" / "Building Landmark, Creating Legacy".

---

*This system records payments made offline; it does not process, transfer, or hold money. All trust/legal claims are limited to what the project's own documents verify.*
