# South Dhaka Properties & Housing Ltd. — Company Website + Multi-Project ERP (Final Build Spec)

**For:** Claude Code (Opus 4.8) — build this project.
**Client / site owner:** **South Dhaka Properties & Housing Ltd.** (the company).
**Deliverable:** One Next.js application = (1) the company's public bilingual website, (2) a **multi-project** admin/staff ERP for land sales, customers, pricing and installments, and (3) a customer portal. **South City is the first *project* under the company; more projects (e.g. North City) will be added later without code changes.**

> ⚠️ **This supersedes all earlier specs (v1–v3).** Earlier the site was "South City". Now the site is the **company**, and South City is one project inside it. Port the existing South City marketing design to become the **project-page template**.

---

## 🧭 কীভাবে ব্যবহার করবেন (owner)

এই ফাইলটা Claude Code (Opus 4.8)-কে দিন — এটাই পুরো সিস্টেমের ব্লুপ্রিন্ট। §19-এর build order ধরে কাজ করতে বলুন। South City-র ছবিগুলো `south-city-images/` ফোল্ডারে আছে — প্রজেক্ট পেজ ও গ্যালারিতে বসবে।

**মনে রাখবেন:** এই সিস্টেম শুধু **অফলাইনে নেওয়া টাকার হিসাব রেকর্ড** করে — কোনো অনলাইন পেমেন্ট/লেনদেন করে না।

**Confirmed decisions:** company-level site + separate project pages · one navy+gold brand (company SD logo; each project keeps its own logo) · legal name **South Dhaka Properties & Housing Ltd.** · multi-project ERP from day one · a customer is **company-level** (one login, plots across any project) · projects shown as a **simple list** (no public status badge) · public pages are **marketing only** — no live ERP data exposed · payments **manually recorded** · **admin creates** all customer/staff logins.

---

## 1. Goal & Scope

Give the company one system that (a) markets the company and each project, and (b) replaces paper-based land-sale record keeping across all projects.

**In scope**
- Public bilingual (বাংলা default / English) **company website** + a reusable **project detail page** (South City is the first).
- **Multi-project ERP** (admin/staff): projects, plot inventory, customers, sales, per-customer pricing, installment schedules, manual payment recording, documents, reports — all filterable by project.
- **Customer portal**: one login shows the customer's plots/installments/payments across all projects.

**Out of scope (now)**
- Online payment gateway (manual recording only).
- Public self-registration (admin creates accounts).
- Live public plot availability (public pages are marketing only).

---

## 2. Site Map & Architecture

One Next.js app, one PostgreSQL DB:

```
Public (bn default, /en English)
  /                      Company home (hero, about-intro, projects grid, why-us, news, CTA)
  /about                 Company profile: about, vision, mission, core values
  /message/chairman      Chairman's message
  /message/md            Managing Director's message
  /projects              All projects (simple list/grid)
  /projects/[slug]       Project detail page  (e.g. /projects/south-city)  ← reusable template
  /news        /news/[slug]     Company news / notices
  /contact               Contact + enquiry form
  (optional) /careers

Customer            /portal            role: CUSTOMER
Admin / ERP         /admin             roles: ADMIN, STAFF
Auth                /login
```

- Public pages: statically rendered / ISR (fast on BD mobile).
- Portal & admin: server-rendered, auth-protected, dynamic.
- All writes and money math run **server-side**; never trust the client for authorization or amounts.

---

## 3. Tech Stack (final)

| Layer | Choice | Notes |
|---|---|---|
| Framework | **Next.js 15+ (App Router, TypeScript)** | Company site + project pages + portal + admin + server logic, one codebase. |
| UI | **Tailwind CSS + shadcn/ui** | Ready tables/forms/dialogs for admin. Company navy+gold brand. |
| Database | **PostgreSQL 16** | Company → projects → plots → sales → installments → payments. |
| ORM | **Prisma** | Type-safe + migrations. |
| Auth | **Auth.js (NextAuth v5)**, Credentials | Roles ADMIN / STAFF / CUSTOMER; admin creates accounts. |
| Validation | **Zod** + React Hook Form | Validate server-side too. |
| Money | **Prisma `Decimal(14,2)`** | Never Float. BDT. |
| Files | VPS volume, served via auth-checked route | Documents, project images, brochures. Optional offsite copy to R2. |
| PDF | `@react-pdf/renderer` | Money receipts, schedules. |
| Charts | `recharts` | Dashboard KPIs. |
| i18n | `next-intl` | bn/en public. |
| Hosting | **Hostinger VPS (Ubuntu 24.04)** | Docker Compose: app + Postgres + Caddy (auto-TLS). §16. |

**VPS:** Hostinger **KVM 2** (2 vCPU / 8 GB RAM / 100 GB NVMe) recommended (KVM 1 workable if you build the image in CI, not on the server).

---

## 4. Data Model (Prisma)

`prisma/schema.prisma` — keep the relationships, the project layer, and the money/audit rules.

```prisma
generator client { provider = "prisma-client-js" }
datasource db { provider = "postgresql"; url = env("DATABASE_URL") }

enum Role              { ADMIN STAFF CUSTOMER }
enum ProjectStatus     { UPCOMING ONGOING COMPLETED }   // internal use; not a public badge
enum PlotStatus        { AVAILABLE RESERVED BOOKED SOLD }
enum PlotCategory      { RESIDENTIAL COMMERCIAL }
enum PaymentType       { FULL INSTALLMENT }
enum SaleStatus        { ACTIVE COMPLETED CANCELLED }
enum InstallmentStatus { PENDING PARTIAL PAID OVERDUE }
enum PaymentMethod     { CASH BANK_TRANSFER CHEQUE BKASH NAGAD OTHER }
enum DocumentType      { NID PHOTO SIGNATURE AGREEMENT DEED MONEY_RECEIPT OTHER }

// ---------- Company (singleton content) ----------
model CompanyProfile {
  id           Int      @id @default(1)          // single row
  nameEn       String   @default("South Dhaka Properties & Housing Ltd.")
  nameBn       String?
  taglinePrimary   String? @default("Where Your Dream Finds Its Address")
  taglineSecondary String? @default("Building Landmark, Creating Legacy")
  aboutEn      String?  aboutBn      String?
  visionEn     String?  visionBn     String?
  missionEn    String?  missionBn    String?
  coreValues   Json?                              // [{en,bn}]
  logoUrl      String?
  phone        String?
  email        String?
  addressEn    String?  addressBn    String?
  facebook     String?  youtube String?  linkedin String?  whatsapp String?
  updatedAt    DateTime @updatedAt
}

model LeaderMessage {           // Chairman & MD messages
  id         String @id @default(cuid())
  role       String                      // "CHAIRMAN" | "MD"
  personName String
  photoUrl   String?
  messageEn  String?
  messageBn  String?
  sortOrder  Int    @default(0)
}

model NewsPost {
  id          String   @id @default(cuid())
  slug        String   @unique
  titleEn     String   titleBn String?
  bodyEn      String?  bodyBn  String?
  coverUrl    String?
  isPublished Boolean  @default(false)
  publishedAt DateTime?
  createdAt   DateTime @default(now())
}

// ---------- Projects ----------
model Project {
  id            String        @id @default(cuid())
  slug          String        @unique        // "south-city"
  nameEn        String        nameBn String?
  status        ProjectStatus @default(ONGOING)  // internal
  tagline       String?
  logoUrl       String?                       // project's own logo (e.g. South City)
  heroImageUrl  String?
  locationEn    String?       locationBn String?
  sizeText      String?                       // "~500 Bigha"
  sectorsText   String?                       // "4 (A–D)"
  plotSizesText String?                       // "3, 5 & 10 Katha"
  roadWidthText String?                       // "25/40/60 ft"
  descriptionEn String?       descriptionBn String?
  amenities     Json?                         // [{icon,en,bn}]
  landmarks     Json?                         // [{group,name,distance}]
  mapEmbedUrl   String?
  brochureUrl   String?
  gallery       ProjectImage[]
  plots         Plot[]
  sales         Sale[]
  isPublished   Boolean       @default(true)
  sortOrder     Int           @default(0)
  createdAt     DateTime      @default(now())
  updatedAt     DateTime      @updatedAt
}

model ProjectImage {
  id        String  @id @default(cuid())
  projectId String
  project   Project @relation(fields: [projectId], references: [id], onDelete: Cascade)
  url       String
  captionEn String? captionBn String?
  sortOrder Int     @default(0)
}

// ---------- ERP core ----------
model User {
  id       String  @id @default(cuid())
  name     String
  email    String  @unique
  phone    String?
  passwordHash String
  role     Role    @default(CUSTOMER)
  isActive Boolean @default(true)
  mustChangePassword Boolean @default(true)
  lastLoginAt DateTime?
  customer Customer?
  payments Payment[] @relation("RecordedBy")
  auditLogs AuditLog[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Customer {                 // company-level (not tied to a project)
  id            String  @id @default(cuid())
  customerCode  String  @unique               // SDC-0001
  userId        String? @unique
  user          User?   @relation(fields: [userId], references: [id])
  fullNameEn    String  fullNameBn String?
  fatherName    String? motherName String? spouseName String?
  nidNumber     String? dateOfBirth DateTime?
  occupation    String? nationality String? @default("Bangladeshi")
  phonePrimary  String  phoneSecondary String? email String?
  presentAddress String? permanentAddress String?
  nomineeName   String? nomineeRelation String? nomineeNid String?
  nomineePhone  String? nomineeAddress String?
  photoUrl      String? signatureUrl String? notes String?
  sales         Sale[]
  documents     Document[]
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}

model Plot {
  id          String       @id @default(cuid())
  projectId   String
  project     Project      @relation(fields: [projectId], references: [id])
  sector      String
  plotNumber  String
  sizeKatha   Decimal      @db.Decimal(6,2)   // 3,5,10
  category    PlotCategory @default(RESIDENTIAL)
  roadWidthFt Int?
  dimensions  String?      faceDirection String?
  status      PlotStatus   @default(AVAILABLE)
  basePrice   Decimal?     @db.Decimal(14,2)  // indicative; real price per sale
  remarks     String?
  sales       Sale[]
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt
  @@unique([projectId, sector, plotNumber])
  @@index([projectId, status, sizeKatha, sector])
}

model Sale {
  id                 String      @id @default(cuid())
  saleCode           String      @unique       // SALE-2026-0001
  projectId          String                      // denormalized for fast filtering
  project            Project     @relation(fields: [projectId], references: [id])
  plotId             String
  plot               Plot        @relation(fields: [plotId], references: [id])
  customerId         String
  customer           Customer    @relation(fields: [customerId], references: [id])
  salePrice          Decimal     @db.Decimal(14,2)
  downPayment        Decimal     @db.Decimal(14,2) @default(0)
  paymentType        PaymentType
  installmentCount   Int?
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
  @@index([projectId, status])
  @@index([customerId, status])
}

model Installment {
  id String @id @default(cuid())
  saleId String
  sale   Sale @relation(fields: [saleId], references: [id], onDelete: Cascade)
  installmentNo Int
  dueDate DateTime
  amountDue Decimal @db.Decimal(14,2)
  amountPaid Decimal @db.Decimal(14,2) @default(0)
  status InstallmentStatus @default(PENDING)
  payments Payment[]
  @@unique([saleId, installmentNo])
  @@index([dueDate, status])
}

model Payment {
  id String @id @default(cuid())
  receiptNo String @unique          // RCP-2026-000123
  saleId String
  sale   Sale @relation(fields: [saleId], references: [id])
  installmentId String?
  installment Installment? @relation(fields: [installmentId], references: [id])
  amount Decimal @db.Decimal(14,2)
  paymentDate DateTime
  method PaymentMethod
  referenceNo String? note String?
  isVoided Boolean @default(false)  voidReason String? voidedAt DateTime?
  recordedById String
  recordedBy User @relation("RecordedBy", fields: [recordedById], references: [id])
  createdAt DateTime @default(now())
  @@index([saleId, paymentDate])
}

model Document {
  id String @id @default(cuid())
  type DocumentType
  fileUrl String fileName String mimeType String? sizeBytes Int?
  customerId String? customer Customer? @relation(fields: [customerId], references: [id])
  saleId String?     sale     Sale?     @relation(fields: [saleId], references: [id])
  uploadedById String
  createdAt DateTime @default(now())
}

model AuditLog {
  id String @id @default(cuid())
  userId String  user User @relation(fields: [userId], references: [id])
  action String  entity String  entityId String
  before Json?   after Json?  ipAddress String?
  createdAt DateTime @default(now())
  @@index([entity, entityId])
}
```

**Money rules:** all amounts `Decimal(14,2)` BDT, never Float. `Installment.amountPaid`/`status` derived from non-voided payments (recompute). Last installment absorbs rounding so the schedule total exactly equals `salePrice − downPayment`.

---

## 5. Roles & Auth

| Role | Can |
|---|---|
| ADMIN | Everything incl. void payments, manage users, edit company/project content, all projects. |
| STAFF | Create/edit projects' plots, customers, sales; record payments. **Cannot** void payments, manage users, or edit company content. |
| CUSTOMER | Read-only view of **their own** sales/installments/payments/documents across all projects. |

- Admin creates all accounts; temp password + `mustChangePassword=true`.
- Hash with argon2 (or bcrypt ≥ 12). Protect routes in middleware **and** re-check role in every server action.
- A CUSTOMER only ever loads rows where `sale.customerId === session.customerId` — enforce in the query.
- Rate-limit login; lock after repeated failures.

---

## 6. Public Company Website

Brand: navy `#14245C`, deep navy `#0E1A44`, gold `#C9A227`, WhatsApp green `#25D366`, white bg, soft `#F6F7FA`. Company **SD logo** in header/footer; each project page also shows its own project logo. Fonts: Poppins/Inter + Hind Siliguri/Noto Sans Bengali (`[lang="bn"]{line-height:1.75}`). Images via `next/image` (WebP, lazy, hero preloaded).

- **Home (`/`)**: hero (company tagline "Where Your Dream Finds Its Address"), short about intro, **Projects grid** (cards linking to each project), why-choose-us strip, latest news, contact CTA, sticky mobile Call/WhatsApp bar + floating WhatsApp.
- **About (`/about`)**: company profile, vision, mission, core values (from `CompanyProfile`).
- **Chairman / MD messages**: `/message/chairman`, `/message/md` (photo + message, bn/en).
- **Projects (`/projects`)**: simple grid/list of all published projects (no status badge). Each card: project logo, name, location, size, plot sizes, "View project".
- **Project detail (`/projects/[slug]`)** — the reusable template (§7).
- **News (`/news`, `/news/[slug]`)**: company notices/updates.
- **Contact (`/contact`)**: address, phone, email, map, enquiry form → saves an Enquiry row + WhatsApp deep link.
- Footer: company logo + taglines, contact, quick links, socials, copyright `© 2026 South Dhaka Properties & Housing Ltd.`

> 🔴 No RAJUK badge, no REHAB logo anywhere (see §21).

---

## 7. Project Detail Page Template (South City = first project)

Reuse the existing South City marketing design as the template driven by `Project` data, so any future project renders the same way. Sections (from project fields/JSON):

- **Hero**: project hero image + name + tagline + USP chips + WhatsApp / "Get plot details" CTAs.
- **Overview + counters**: description + size / sectors / plot sizes / progress.
- **Trust row**: verifiable items only (Trade License, transparent docs, registration on full payment, up to 5-yr installments, land acquired, riverside) — no RAJUK/REHAB.
- **At a glance**: size, sectors, plot sizes, road widths, payment terms + **Download Brochure** (project `brochureUrl`).
- **Master plan**: project master-plan image (`south-city-images/master-plan.jpg` for South City) with sector hotspots.
- **Plot sizes tabs**: 3 / 5 / 10 Katha (dimensions, price or "Call for price").
- **Location**: lazy Google Map (`mapEmbedUrl`) + distance chart + boundaries.
- **Landmark tabs**: Connectivity / Education / Health / Daily needs (from `landmarks`).
- **Amenities grid** (from `amenities`).
- **Gallery** (`ProjectImage[]` — South City images).
- **Enquiry form** → Enquiry row + WhatsApp.

South City images live in `south-city-images/` (hero, gallery-*, master-plan.jpg already prepared).

---

## 8. Admin ERP (`/admin`)

Global **project switcher / filter** in the admin shell so every list can be scoped to a project or "All projects".

- **Dashboard**: company-wide + per-project KPIs — plots by status, sold this month, **collection this month (BDT)**, **outstanding dues**, overdue count, recent payments.
- **Projects**: CRUD project records (name, logo, hero, description, amenities, landmarks, map, brochure, gallery). This is how a new project (North City) is added — no code change.
- **Plots**: table filtered by **project → sector → size (3/5/10 Katha) → status**; CRUD + CSV import; plot detail shows owner + sale history.
- **Customers**: search (name/phone/NID/code); filters incl. **which project(s) they own in**, plot size, payment status; detail page with profile, all sales across projects, schedules, payments, documents, "Create login account".
- **Sales**: new-sale flow — pick project → available plot → customer → negotiated price → FULL/INSTALLMENT → schedule preview → confirm (sets plot BOOKED, writes AuditLog).
- **Installments & payments** ⭐: schedule view; **Record Payment** (installment/general, amount, date, method, ref, note) → recalc status, generate receipt no + **PDF money receipt**; partial + advance payments (allocate to oldest unpaid first); auto-OVERDUE; payments **voided** (ADMIN, with reason), never deleted.
- **Documents**: upload per customer/sale (NID, photo, signature, agreement, deed, receipts) to the VPS volume; access via auth-checked route only.
- **Content**: edit CompanyProfile, Chairman/MD messages, News, and each Project's marketing content + media + brochure. Revalidate affected pages on save.
- **Users & AuditLog** (ADMIN): create/deactivate staff & customers, reset passwords, view audit trail.

---

## 9. Customer Portal (`/portal`)

One login (admin-issued; force password change first time). Shows, **across all projects the customer owns in**: their plot(s) (project, sector, plot no, size, booking date), total price / paid / outstanding / next due, full installment schedule + status, payment history with downloadable receipts, their documents, and profile (corrections go to admin). Fully mobile-responsive.

---

## 10. Digital Purchase Form (hard copy → soft copy)

Multi-step admin form (also printable as PDF for signature) capturing: buyer (name en/bn, father/mother/spouse, NID, DOB, occupation, nationality, phones, email), present & permanent address, nominee (name/relation/NID/phone/address), **project + plot + terms** (sector, plot no, size, category, agreed price, down payment, full/installment, months, start date), and attachments (photo, signature, NID). Validate with Zod (phone `01XXXXXXXXX`, NID digits). Save drafts. Submit → creates Customer (if new) + Sale + schedule in one transaction.

---

## 11. Installment Engine

```
financed       = salePrice − downPayment
perInstallment = round(financed / installmentCount, 2)
amountDue[1..n-1] = perInstallment
amountDue[n]      = financed − perInstallment*(n-1)      // absorbs rounding
dueDate[i]        = installmentStartDate + i months
```
Recompute `amountPaid` = Σ non-voided payments allocated. Status: PAID (≥ due), PARTIAL (0<paid<due), OVERDUE (unpaid & past due), else PENDING. Sale → COMPLETED and plot → SOLD when total non-voided payments ≥ salePrice. Everything to AuditLog.

> 🔴 Confirm late-fee / grace-period / cancellation-refund policy before building this (§21) — it changes the math.

---

## 12. Reports & Filters

All scoped by **project** (or all): **who bought what** (filter by project, plot size 3/5/10 Katha, sector, date, staff, payment type); **dues report**; **collection report** (by method/staff, monthly totals); **overdue list** (for follow-up); **inventory report** (by status/size). All exportable to **CSV** and printable.

---

## 13. Localization

Public bn default + `/en` (`next-intl`). Katha primary (1 Katha = 720 sq ft ≈ 66.9 m²; 1 Bigha = 20 Katha). BDT **৳** with lakh grouping (`Intl.NumberFormat('en-IN',{style:'currency',currency:'BDT',maximumFractionDigits:0})`). Admin/portal Bangla labels fine; dates `DD/MM/YYYY`.

---

## 14. Security & Privacy (financial + personal data)

HTTPS everywhere; secure httpOnly sameSite cookies. argon2/bcrypt passwords; never log/email plaintext. **Server-side RBAC on every query & mutation** — a customer can never fetch another's rows by changing an ID. Zod-validate server-side; Prisma parameterized queries only. Rate-limit `/login`; lock on abuse. Documents only via authenticated ownership-checked route. **AuditLog** every create/update/void of Sale, Payment, Customer, Plot, Project, User. Postgres bound to the Docker network only — **never expose 5432**. VPS: SSH keys only (disable root+password login), `ufw` 22/80/443, `fail2ban`, unattended security updates. Secrets in `.env` (not git). Restrict NID/photos to ADMIN/STAFF + owner; never in URLs/logs.

---

## 15. Backups & Recovery

Nightly `pg_dump` (retain 14–30 days) **and** the uploads volume. Copy backups **off the VPS** (R2/S3/Drive). Enable Hostinger snapshots as a second layer. **Test a restore before go-live** and document it.

---

## 16. Hostinger VPS — Setup & Deploy

**KVM 2, Ubuntu 24.04.**

Harden: create `deploy` sudo user, SSH key only, `PermitRootLogin no`, `PasswordAuthentication no`, `ufw allow OpenSSH 80 443 && ufw enable`, install `fail2ban`, `apt upgrade`.

Install Docker (`curl -fsSL https://get.docker.com | sh`).

`docker-compose.yml`: services **db** (postgres:16, no public `ports`), **app** (Next.js build, `.env`, uploads volume), **caddy** (ports 80/443, reverse_proxy to app, auto Let's Encrypt). `Caddyfile`:
```
southdhaka.com.bd, www.southdhaka.com.bd { reverse_proxy app:3000 }
```
Next.js: `output: 'standalone'`, multi-stage Dockerfile (build in CI if RAM is tight).

Deploy:
```bash
git clone <repo> && cd app && cp .env.example .env   # fill secrets
docker compose up -d --build
docker compose exec app npx prisma migrate deploy
docker compose exec app npm run seed                 # first ADMIN + company profile + South City project
```
Point the domain A record → VPS IP (Caddy issues TLS). Add nightly backup cron. Optional Cloudflare in front for CDN/DDoS on public pages.

---

## 17. Folder Structure

```
app/
├─ prisma/  schema.prisma  migrations/  seed.ts
├─ src/
│  ├─ app/
│  │  ├─ (public)/  page.tsx about/ message/ projects/[slug]/ news/ contact/  + /en
│  │  ├─ portal/    admin/   api/   login/
│  ├─ components/   ui/ (shadcn)  public/  admin/  project/
│  ├─ server/       actions/  services/(installments,payments,reports)  auth.ts  db.ts
│  ├─ lib/          money.ts katha.ts rbac.ts audit.ts validators/
│  └─ i18n/         bn.json en.json
├─ uploads/         # documents, project images, brochures (mounted volume)
├─ docker-compose.yml  Dockerfile  Caddyfile  .env.example
```

---

## 18. Environment Variables

```
DATABASE_URL=postgresql://sdph:<pw>@db:5432/sdph
AUTH_SECRET=<openssl rand -base64 32>
AUTH_URL=https://southdhaka.com.bd
POSTGRES_PASSWORD=<strong>
UPLOAD_DIR=/app/uploads
NEXT_PUBLIC_SITE_URL=https://southdhaka.com.bd
NEXT_PUBLIC_WHATSAPP=8801XXXXXXXXX
```

---

## 19. Build Order

1. Scaffold Next.js + TS + Tailwind + shadcn; brand tokens; base layout + i18n.
2. Prisma schema (§4) → migrate → **seed**: company profile, South City project (with data from "Seed data" below), 4 sectors + sample plots, first ADMIN.
3. Auth (roles, middleware, login, force-password-change, RBAC helper).
4. Admin shell with **project switcher**; dashboard placeholder.
5. **Projects module** (CRUD + media + content) — so projects are data, not code.
6. Plots module (CRUD + filters + CSV import).
7. Customers module + digital purchase form (§10) + documents + create-login.
8. Sales module (new-sale flow + schedule generation).
9. **Payments module** (record, allocate, statuses, void, PDF receipt) — test the math hardest.
10. Reports (§12) + dashboard KPIs + CSV.
11. Customer portal (§9).
12. **Public company site** (§6) + **project template** (§7) porting South City design + content admin.
13. Security pass (§14), audit logs, backups (§15).
14. Dockerize + deploy to Hostinger (§16); mobile QA + real-device test.

Write server-side tests for the installment/payment math.

---

## 20. Pre-Launch Checklist

- [ ] Installment math verified (incl. last-installment rounding, partial & advance payments).
- [ ] Voided payments excluded from all totals/reports.
- [ ] CUSTOMER cannot access another customer's data (test tampering IDs); STAFF cannot void or manage users.
- [ ] Project filter works across plots/customers/sales/reports.
- [ ] Money stored/shown as Decimal BDT with lakh grouping.
- [ ] Documents only downloadable by authorized users.
- [ ] AuditLog records every financial action with user + timestamp.
- [ ] Nightly DB + uploads backup running **and a restore tested**.
- [ ] Postgres not public; ufw + fail2ban + SSH keys; HTTPS working.
- [ ] Public site bn+en proof-read, mobile responsive, Lighthouse mobile ≥ 90.
- [ ] No RAJUK / REHAB claim anywhere.
- [ ] Adding a second project (e.g. North City) works purely via the admin Projects module.
- [ ] First ADMIN created; temp passwords changed.

---

## 21. 🔴 Confirm With the Owner Before Launch

- **RAJUK:** not required/held → no badge. **REHAB:** not a member → no logo.
- **Public phone / email / office address** (Rahman Chamber/Mansion, Motijheel — confirm exact) for the site + receipts.
- **South City plot prices** per Katha, or "Call for price".
- **Money-receipt format**: company header, signature line, serial format.
- **Installment policy**: late fee? grace period? cancellation/refund rules? (Confirm before §11.)
- **Domain**: `southdhaka.com.bd` assumed — confirm.

---

## Seed Data

**Company:** South Dhaka Properties & Housing Ltd. · taglines "Where Your Dream Finds Its Address" / "Building Landmark, Creating Legacy" · office Rahman Chamber, Motijheel, Dhaka (confirm) · email `info@southdhaka.com.bd` (confirm) · phone (confirm) · About/Vision/Mission/Core Values + Chairman's & MD's messages: use the text from the client's brochure (Company Profile, Chairman's Message, Managing Director's Message pages).

**Project: South City** (slug `south-city`) — Sayedpur, South Keraniganj, Dhaka (beside KC Road, near Dhaka–Mawa Expressway & Eastern Bypass) · ~500 Bigha · 4 sectors (A–D) · plots 3, 5 & 10 Katha (residential + commercial) · roads 25/40/60 ft · facilities: central mosque, schools, health centre, super shop, gym, coffee shop, walking trails, green spaces, play area, 24/7 security · registration on full payment, installments up to 5 years · ~40% land acquired · distances: Dhaka 22 km, Dhaka–Mawa Expressway 1.5 km, Padma Bridge 12 km, Keraniganj 6 km, airport 30–35 min · boundaries: W = KC Road, E = Dhaleshwari River + embankment, N = Sayedpur Para, S = Nimtali · images in `south-city-images/` (hero, gallery-*, master-plan.jpg).

---

*This system records payments made offline; it does not process, transfer, or hold money. All trust/legal claims are limited to what the project's own documents verify.*
