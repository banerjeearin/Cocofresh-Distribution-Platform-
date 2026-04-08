# CocoFresh Distribution Platform

**Version:** 2.0 — Production  
**Last Updated:** April 2026  
**Status:** Live on DigitalOcean — `https://coco.liimra.in`  
**Repository:** `https://github.com/banerjeearin/Cocofresh-Distribution-Platform-.git`

---

## Table of Contents

1. [Overview](#1-overview)
2. [Live Infrastructure](#2-live-infrastructure)
3. [Local Development Setup](#3-local-development-setup)
4. [Environment Variables](#4-environment-variables)
5. [Tech Stack](#5-tech-stack)
6. [Project Structure](#6-project-structure)
7. [Database Schema](#7-database-schema)
8. [API Reference](#8-api-reference)
9. [Features Implemented](#9-features-implemented)
10. [Business Rules](#10-business-rules)
11. [Deployment Guide](#11-deployment-guide)
12. [Known Issues & Gotchas](#12-known-issues--gotchas)

---

## 1. Overview

CocoFresh is a last-mile **coconut subscription distribution platform** for LIIMRA Naturals. It manages the complete delivery lifecycle for a coconut distributor — from customer onboarding and subscription management to daily delivery tracking, billing, invoice generation, and WhatsApp communication.

The **admin** operates a fully responsive web dashboard (desktop + mobile). Customers interact **exclusively via WhatsApp**.

---

## 2. Live Infrastructure

| Component | URL / Resource | Notes |
|---|---|---|
| **Frontend (Static Site)** | `https://coco.liimra.in` | React + Vite SPA, served at `/` |
| **Backend (Web Service)** | `https://coco.liimra.in/api` | Fastify REST API, served at `/api` |
| **Database** | Supabase PostgreSQL | Project: `xhwqkydkeendmgzfpxyk` |
| **Platform** | DigitalOcean App Platform | Auto-deploys on push to `main` |
| **Domain** | `coco.liimra.in` | Custom domain via DigitalOcean |

### DigitalOcean App Structure

```
coco.liimra.in/
├── /          → Static Site  (web/dist)
└── /api/*     → Web Service  (backend/)
```

---

## 3. Local Development Setup

### Prerequisites
- Node.js v22+ (or v24 — engine warning is harmless)
- npm v10+

### 1. Clone the repo
```bash
git clone https://github.com/banerjeearin/Cocofresh-Distribution-Platform-.git
cd Cocofresh-Distribution-Platform-
```

### 2. Install backend dependencies
```bash
cd backend
npm install
```

### 3. Configure backend environment
Create `backend/.env` (see [Section 4](#4-environment-variables))

### 4. Generate Prisma client & push schema
```bash
# From backend/
npx prisma generate
npx prisma db push          # Creates tables in Supabase
npx tsx prisma/seed-prod.ts # Seeds CoconutGrade master data
```

### 5. Start backend
```bash
# From backend/
npm run dev
# Runs on http://localhost:3001
```

### 6. Start frontend
```bash
# From web/
npm install
npm run dev
# Runs on http://localhost:5173
```

---

## 4. Environment Variables

### Backend — `backend/.env`

```env
DATABASE_URL=postgresql://postgres.xhwqkydkeendmgzfpxyk:PASSWORD@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true
DIRECT_URL=postgresql://postgres.xhwqkydkeendmgzfpxyk:PASSWORD@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true
TZ=Asia/Kolkata
```

> ⚠️ **Important:** Do NOT wrap URLs in quotes. Prisma will treat the quote character as part of the connection string and fail with "invalid arguments".

### Frontend — `web/.env.production`

```env
VITE_API_URL=https://coco.liimra.in/api
```

### DigitalOcean App Platform (Backend Service)

These must be set manually in the DigitalOcean dashboard under **Settings → Environment Variables**:

| Variable | Value |
|---|---|
| `DATABASE_URL` | Raw PostgreSQL connection string (no quotes) |
| `PORT` | Set automatically by DigitalOcean |
| `TZ` | `Asia/Kolkata` |

---

## 5. Tech Stack

### Frontend
| Layer | Technology |
|---|---|
| Framework | React 18 + Vite |
| Routing | React Router v6 |
| Styling | Tailwind CSS (mobile-first) |
| State / Data | React Query (TanStack Query v5) |
| HTTP Client | Axios |
| PWA | vite-plugin-pwa |
| Build | Vite (output: `web/dist/`) |

### Backend
| Layer | Technology |
|---|---|
| Runtime | Node.js 22.x |
| Framework | Fastify 4 |
| ORM | Prisma 6 |
| Database | PostgreSQL (Supabase) |
| Validation | Zod + fastify-type-provider-zod |
| Auth | @fastify/jwt |
| Timezone | `process.env.TZ = 'Asia/Kolkata'` set at startup |

---

## 6. Project Structure

```
/
├── backend/                    ← Fastify API server
│   ├── src/
│   │   ├── server.ts           ← Entry point, route registration
│   │   ├── routes/
│   │   │   ├── customers.ts
│   │   │   ├── deliveries.ts   ← Mark slots delivered/skipped/pending
│   │   │   ├── holidays.ts     ← Customer holiday calendar
│   │   │   ├── grades.ts       ← CoconutGrade master
│   │   │   ├── payments.ts
│   │   │   ├── invoices.ts
│   │   │   ├── whatsapp.ts
│   │   │   └── dashboard.ts
│   │   └── services/
│   │       ├── CustomerService.ts    ← Customer CRUD + slot generation
│   │       ├── DeliveryService.ts    ← Mark/bulk-mark slots, revert to pending
│   │       ├── HolidayService.ts     ← Holiday add/remove + end date extension
│   │       ├── GradeService.ts
│   │       ├── PaymentService.ts
│   │       ├── InvoiceService.ts
│   │       ├── WhatsAppService.ts
│   │       └── DashboardService.ts
│   ├── prisma/
│   │   ├── schema.prisma       ← Full data model
│   │   └── seed-prod.ts        ← Seeds CoconutGrade master data
│   └── .env                    ← Local environment (not committed)
│
├── web/                        ← React frontend
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Customers.tsx
│   │   │   ├── CustomerProfile.tsx  ← Interactive calendar, holidays, payments
│   │   │   ├── Deliveries.tsx
│   │   │   ├── Invoices.tsx
│   │   │   └── WhatsAppHub.tsx
│   │   ├── components/
│   │   │   ├── Layout.tsx           ← Mobile drawer sidebar
│   │   │   ├── DeliveryCalendar.tsx ← Interactive click-to-update calendar
│   │   │   └── HolidayCalendar.tsx  ← Multi-subscription holiday manager
│   │   └── services/
│   │       └── api.ts               ← All API calls via Axios
│   ├── .env.production         ← VITE_API_URL for production
│   └── .npmrc                  ← legacy-peer-deps=true (for vite-plugin-pwa)
│
├── .do/                        ← DigitalOcean App Platform spec
│   └── app.yaml
└── package.json                ← Root scripts
```

---

## 7. Database Schema

> Managed via Prisma. See `backend/prisma/schema.prisma` for the full definition.

### Core Tables

| Table | Purpose |
|---|---|
| `Customer` | Customer master — name, mobile, status, primary address |
| `CustomerAddress` | Named delivery addresses per customer (Home, Office, etc.) |
| `Subscription` | 30-day subscription cycle per customer-address pair |
| `SubscriptionPlan` | Plan details — qty/day, price/unit, grade; versioned with `effective_from` |
| `PlanChangeLog` | Audit trail of all plan changes (price, qty) |
| `DeliverySlot` | One slot per customer per day — status: pending/delivered/skipped/holiday |
| `BillingEntry` | Created automatically when a slot is marked Delivered; immutable |
| `Payment` | Payment records — amount, mode, date |
| `CustomerHoliday` | Holiday calendar — per subscription, per date |
| `GradeChangeLog` | Per-slot coconut grade overrides |
| `CoconutGrade` | Master grade table — Grade-A (₹70), Grade-B (₹55) |
| `WaMessageLog` | WhatsApp message history |

### Key Relationships

```
Customer (1) ──── (N) CustomerAddress
Customer (1) ──── (N) Subscription
CustomerAddress (1) ── (N) Subscription
Subscription (1) ──── (N) SubscriptionPlan     [versioned]
Subscription (1) ──── (N) DeliverySlot
Subscription (1) ──── (N) CustomerHoliday
DeliverySlot (1) ───── (1) BillingEntry         [on Delivered]
Customer (1) ──── (N) Payment
```

### Seeding Master Data

After first deploy or fresh DB, run this SQL in Supabase SQL Editor:

```sql
INSERT INTO "CoconutGrade" (id, label, price_per_unit, is_active, created_at)
VALUES
  ('grade-a', 'Grade-A', 70, true, NOW()),
  ('grade-b', 'Grade-B', 55, true, NOW())
ON CONFLICT (id) DO NOTHING;
```

---

## 8. API Reference

All endpoints are prefixed with `/api`.

### Health
| Method | Endpoint | Description |
|---|---|---|
| GET | `/health` | Server health check |

### Customers
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/customers` | List all customers |
| POST | `/api/customers` | Create customer + address + subscription + delivery slots |
| GET | `/api/customers/:id` | Full customer profile (subscriptions, slots, payments, holidays) |
| PUT | `/api/customers/:id` | Update customer (name, mobile, status) |

### Deliveries
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/deliveries?date=YYYY-MM-DD` | Get delivery slots for a date (defaults to today) |
| PATCH | `/api/deliveries/:id` | Mark slot: `action = delivered \| skipped \| pending` |
| POST | `/api/deliveries/bulk` | Bulk mark slots as delivered or skipped |

### Holidays
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/holidays/:customerId` | List all holidays for a customer |
| POST | `/api/holidays` | Add a single holiday date (extends subscription end_date by 1) |
| POST | `/api/holidays/range` | Add a date range of holidays |
| DELETE | `/api/holidays/:id` | Remove a holiday (shortens subscription end_date by 1) |

### Grades
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/grades` | List active grades |
| POST | `/api/grades` | Create grade |
| PATCH | `/api/grades/:id` | Update grade |
| DELETE | `/api/grades/:id` | Deactivate grade |
| PATCH | `/api/subscriptions/:id/grade` | Set grade for a subscription |
| PATCH | `/api/delivery-slots/:id/grade` | Override grade for a single slot |

### Payments
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/payments` | List all payments |
| POST | `/api/payments` | Record a payment |
| GET | `/api/payments/receipt/:id` | Get payment receipt |

### Invoices & Dashboard
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/invoices` | Get invoice data (filter by year/month) |
| GET | `/api/dashboard` | Aggregated stats for dashboard |

### WhatsApp
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/whatsapp` | List WhatsApp message log |
| POST | `/api/whatsapp` | Log a WhatsApp message |
| PATCH | `/api/whatsapp/:id/sent` | Mark message as sent |

---

## 9. Features Implemented

### ✅ Customer Management
- Register customer with name, mobile, address, plan (qty/day, price, grade)
- Auto-generate 30-day delivery slots on registration
- Customer profile with subscription stats, billing ledger, address list
- Status management (Active / Paused / Churned)

### ✅ Interactive Delivery Calendar
- Visual calendar in Customer Profile → Subscription tab
- **Click any cell to update delivery status:**
  - **Pending → Delivered**: Opens qty popover (−/+ spinner) → confirm → billing entry auto-created
  - **Delivered → Skipped**: Single click → billing entry removed
  - **Skipped → Pending**: Single click → reverts slot cleanly
  - **Holiday → Remove**: Confirm dialog → slot reverted + subscription end date shortened by 1 day
- Month navigation (‹ ›) for multi-month subscriptions
- Fully mobile-responsive (minimum 44px cell touch targets)

### ✅ Holiday Calendar (Multi-Subscription)
- Accessible via Customer Profile → Holidays tab
- **Subscription selector dropdown** — choose which subscription(s) to apply holiday to
- **"Apply to ALL active subscriptions"** toggle (appears when customer has 2+)
- Single date or date range holiday entry
- Each holiday automatically:
  - Sets that day's delivery slot status to `holiday`
  - Extends that subscription's end date by 1 day
- Removing a holiday reverts the slot and shortens end date by 1 day
- Holiday history displayed **grouped by subscription** with updated end date shown
- Works retroactively (past dates allowed) with no minimum notice period

### ✅ Daily Deliveries Page
- View all delivery slots for any date (default: today)
- Mark individual slots as delivered/skipped
- Bulk-mark all pending slots as "All Done"
- Retrospective badge when viewing past dates
- Stats: Total / Delivered / Pending / Skipped / Missed

### ✅ Billing & Payments
- Billing entry auto-created when slot marked Delivered
- Price locked at delivery time (respects mid-cycle grade changes)
- Payment recording (Cash, UPI, Bank Transfer)
- Real-time outstanding balance per customer

### ✅ Coconut Grade System
- Grade-A (₹70/nut), Grade-B (₹55/nut)
- Set at subscription level or overridden per individual slot
- Grade history audit trail (GradeChangeLog)

### ✅ Invoice Generation
- Date-wise delivery log per customer
- Per-slot price and qty locked at delivery time
- Monthly summary with total billed / paid / outstanding

### ✅ WhatsApp Integration
- Message log per customer
- Templates: Welcome, Skip Ack, Invoice, Price Change, Reminder, Renewal
- Manual copy-to-clipboard flow (Phase 1)

### ✅ Mobile-Responsive Design
- Sliding drawer sidebar on mobile (hamburger menu)
- Dashboard KPI grids stack on mobile
- Calendar cells have 44px minimum touch targets
- Tables wrap in horizontal scroll containers
- "Tap a cell to update" hints on mobile

---

## 10. Business Rules

| Rule | Description |
|---|---|
| **Billing** | Only `delivered` slots are billed. `skipped` and `holiday` slots are never billed. |
| **Price Lock** | Each billing entry locks the price at the moment of delivery. Mid-cycle price changes do not affect past delivered slots. |
| **Holiday Extension** | Each holiday day added extends the subscription end date by exactly 1 day. Removing a holiday shortens it by 1 day. |
| **Holiday Slot** | A slot marked `holiday` cannot be marked delivered/skipped. Remove the holiday first. |
| **Slot Revert** | A delivered or skipped slot can be reverted to `pending` via calendar click. Billing entry is deleted on revert. |
| **No Auto-Renewal** | All subscription renewals are manual and admin-triggered only. |
| **Deliveries Every Day** | Delivery slots are created for all 7 days (including Sundays). No weekday-only restriction. |
| **One Slot Per Day** | Each subscription has exactly one delivery slot per day. |
| **IST Timezone** | All dates and times are stored and displayed in Asia/Kolkata (IST, UTC+5:30). `TZ=Asia/Kolkata` is set at server startup. |
| **Slot Creation Skip** | When creating a new customer, if a holiday already exists for a subscription + date, no delivery slot is created for that date. |

---

## 11. Deployment Guide

### Automatic Deployment (Normal Flow)
Push to `main` → DigitalOcean auto-detects and redeploys both backend and frontend.

```bash
git add -A
git commit -m "your message"
git push origin main
```

### Backend Build (DigitalOcean)
```bash
cd backend
npm install
npm run build    # tsc → dist/
```
Run command: `node dist/server.js`

### Frontend Build (DigitalOcean)
```bash
cd web
npm install --legacy-peer-deps
npm run build    # Vite → dist/
```
Output directory: `web/dist`

### Resolving Peer Dependency Conflicts
The `vite-plugin-pwa` package conflicts with Vite 8.x. This is resolved via `web/.npmrc`:
```
legacy-peer-deps=true
```

### First-Time DB Setup
After deploying a fresh backend with a new database:
1. Set `DATABASE_URL` in DigitalOcean env vars (no quotes!)
2. Run `npx prisma db push` (or ensure migrations run)
3. Seed grades via Supabase SQL Editor (see Section 7)

---

## 12. Known Issues & Gotchas

### `.env` Quotes Break Prisma
**Problem:** If `DATABASE_URL` is wrapped in `"quotes"` in the `.env` file or DigitalOcean env vars, Prisma throws: *"The provided database string is invalid. The provided arguments are not supported."*  
**Fix:** Use raw values without any wrapping quotes.

### Legacy Peer Deps for vite-plugin-pwa
**Problem:** vite-plugin-pwa requires `vite ^3–^7` but the project uses Vite 8.  
**Fix:** `web/.npmrc` contains `legacy-peer-deps=true` — do not remove this file.

### CoconutGrade Seed Required
**Problem:** Creating a customer fails with `SubscriptionPlan_grade_id_fkey` foreign key error if no grades exist.  
**Fix:** Run the seed SQL (Section 7) in Supabase once after fresh DB setup.

### Supabase Session Mode (PgBouncer)
The connection string uses **port 6543** (PgBouncer / session mode). Do not change this to port 5432 unless using a direct connection (required for `prisma migrate`). For migrations in CI/CD, use a separate `DIRECT_URL` pointed at port 5432.

### Backend NODE_ENV Detection
The `engines` field in `backend/package.json` specifies `node: "22.x"`. DigitalOcean is running Node 24 which triggers a warning — this is **harmless** and does not affect functionality.

---

*Built by LIIMRA Naturals & Antigravity AI — April 2026*
