# CocoFresh — Coconut Subscription Distribution Platform
## Business Requirements Document & Technical Architecture

**Version:** 1.2  
**Date:** April 2026  
**Status:** Approved for Development  
**Changes from v1.1:** Multiple delivery addresses per customer supported — each address is independently named, managed, and linked to its own subscription; `customer_addresses` table introduced; delivery slot carries `address_id`; invoice shows per-address delivery breakdown; FR and data schema updated accordingly; assumption 4 resolved.

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Business Context & Objectives](#2-business-context--objectives)
3. [Stakeholders](#3-stakeholders)
4. [Business Requirements](#4-business-requirements)
   - 4.1 Customer Management
   - 4.2 Subscription Model & Multi-Unit Plans
   - 4.3 Delivery Schedule Management
   - 4.4 Partial-Day Delivery Slots
   - 4.5 Payment Management
   - 4.6 WhatsApp Communication Interface
   - 4.7 Invoice & Reporting
5. [Functional Requirements](#5-functional-requirements)
6. [Non-Functional Requirements](#6-non-functional-requirements)
7. [Business Rules](#7-business-rules)
8. [User Journeys](#8-user-journeys)
9. [Technical Architecture](#9-technical-architecture)
   - 9.1 Architecture Overview
   - 9.2 System Components
   - 9.3 Data Architecture
   - 9.4 Integration Architecture
   - 9.5 WhatsApp Integration Design
   - 9.6 Infrastructure & Deployment
10. [Data Dictionary](#10-data-dictionary)
11. [API Specification](#11-api-specification)
12. [Security & Compliance](#12-security--compliance)
13. [Implementation Roadmap](#13-implementation-roadmap)
14. [Resolved Decisions & Remaining Assumptions](#14-resolved-decisions--remaining-assumptions)

---

## 1. Executive Summary

CocoFresh is a last-mile coconut distribution platform designed for small-to-medium coconut distributors serving retail customers on a subscription basis. The platform manages the complete lifecycle — from customer onboarding (with support for multiple named delivery addresses per customer), daily delivery scheduling (with morning and evening slot support), skip and reschedule requests, mid-cycle price and quantity adjustments, payment collection (advance or credit), WhatsApp-based customer communication, and monthly invoice generation with date-wise, address-wise delivery proof.

The admin (distributor/owner) operates a fully responsive web dashboard accessible on both desktop and mobile browsers. The customer-facing channel is exclusively **WhatsApp** — a zero-app-install experience. All WhatsApp communication is in English.

Subscription renewal is **manual and admin-triggered only**. There is no auto-renewal.

---

## 2. Business Context & Objectives

### Problem Statement

Traditional coconut distributors manage customers through notebooks, phone calls, and manual registers. This leads to:

- Missed deliveries with no tracking or accountability
- No mechanism to handle skip requests or route holidays
- Disputes over quantities delivered and amounts owed, especially with variable-quantity customers
- No delivery-slot-level tracking (morning vs. evening runs)
- No formal invoice or delivery proof for customers
- Manual and error-prone payment reconciliation

### Business Objectives

| # | Objective | Success Metric |
|---|-----------|---------------|
| 1 | Digitise customer subscription management | 100% customers on digital roster |
| 2 | Support variable quantity and price per customer | Each customer has their own qty/price profile |
| 3 | Enable mid-cycle price and quantity adjustments | Admin can update pricing at any point; audit trail maintained |
| 4 | Track deliveries at slot level (morning / evening) | Each delivery slot carries a time-of-day flag |
| 5 | Provide verifiable delivery proof | Every slot logged with date, time-of-day, qty, and status |
| 6 | Reduce payment disputes | Invoice generated monthly with delivery proof |
| 7 | Enable customer self-service via WhatsApp | Skip requests handled without phone calls |
| 8 | Improve cash flow visibility | Real-time outstanding per customer |

---

## 3. Stakeholders

| Role | Description | System Access |
|------|-------------|---------------|
| Admin / Owner | Distributor who manages all operations | Full dashboard — desktop + mobile browser |
| Delivery Agent | Person delivering coconuts on the route | Mobile delivery confirmation (Phase 2 app) |
| Customer | Retail subscriber receiving daily coconuts | WhatsApp interface only |

---

## 4. Business Requirements

### 4.1 Customer Management

**BR-CM-01:** The system shall allow the admin to register a new customer with the following mandatory attributes: name, WhatsApp mobile number, subscription start date, and payment mode (advance or COD/credit). At least one delivery address must be added during registration.

**BR-CM-02:** Each customer shall have a unique system-generated ID and a human-readable customer code (e.g. CCF-001).

**BR-CM-03:** The system shall maintain a customer status — Active, Paused, or Churned.

**BR-CM-04:** On registration, the system shall auto-generate a 30-day delivery schedule beginning from the subscription start date, using the customer's default plan (quantity and price).

**BR-CM-05:** The admin shall be able to view a customer's complete profile — subscription details, delivery history (per address), payment history, pricing history, and outstanding balance — from a single screen.

**BR-CM-06:** The admin interface shall be fully responsive, providing an equivalent experience on desktop browsers (≥1024px) and mobile browsers (≥320px) without requiring a separate app.

**BR-CM-07:** A customer may have **multiple named delivery addresses** (e.g. Home, Office, Parents' House). Each address is independently registered with a label, full address text, and an active/inactive status.

**BR-CM-08:** Each subscription is linked to a specific delivery address. A customer with multiple addresses can have separate active subscriptions running concurrently, one per address, each with its own plan (quantity, price, time-band configuration).

**BR-CM-09:** The admin shall be able to add, edit, or deactivate a delivery address for a customer at any time. Deactivating an address does not affect historical delivery records linked to it.

**BR-CM-10:** The admin shall be able to designate one address as the customer's **primary address** for default display and WhatsApp communication purposes.

---

### 4.2 Subscription Model & Multi-Unit Plans

**BR-SUB-01:** The standard subscription package is **30 delivery days per month**, with deliveries scheduled for all 7 days of the week.

**BR-SUB-02:** The quantity of coconuts per delivery is **customer-specific** and set at the time of subscription registration. Each customer may subscribe for a different number of coconuts per delivery (e.g. 1, 2, 3, or more).

**BR-SUB-03:** Pricing is **customer-specific** — each customer has their own negotiated price per coconut.

**BR-SUB-04:** A customer's subscription plan captures the following parameters:

| Parameter | Description |
|-----------|-------------|
| Delivery address | The specific registered address for this subscription |
| Coconuts per delivery slot | Default quantity for each delivery (e.g. 2 per slot) |
| Price per coconut | Customer's unit rate |
| Delivery slot(s) | Morning, Evening, or Both per day |
| Payment mode | Advance or COD |

**BR-SUB-05:** The admin shall be able to **modify the price per coconut mid-cycle** for any customer. The change shall apply from the date of modification onwards. Previously delivered slots retain the price applicable at the time of delivery. A full pricing history shall be maintained for audit purposes.

**BR-SUB-06:** The admin shall be able to **modify the quantity per delivery slot mid-cycle**. The change applies from the modification date onwards. Previously delivered slots retain their original quantity. Quantity change history shall be logged.

**BR-SUB-07:** A subscription month is defined as a rolling 30-day period from the subscription start date, not a calendar month.

**BR-SUB-08:** Subscription renewal is **manual and admin-triggered only**. The system shall prompt the admin when a subscription is within 5 days of its end date. There is no auto-renewal under any circumstance.

**BR-SUB-09:** The system shall support multiple active subscriptions simultaneously across all registered customers.

**BR-SUB-10:** The system shall support future extensibility for additional product types beyond coconuts (e.g. coconut water bottles), but this is out of scope for Phase 1.

---

### 4.3 Delivery Schedule Management

**BR-DS-01:** The 30-day delivery schedule shall be auto-generated on customer registration, with delivery slots per day as configured in the subscription plan (morning slot, evening slot, or both).

**BR-DS-02:** Each delivery slot shall carry one of the following statuses:

| Status | Definition |
|--------|-----------|
| Pending | Delivery due but not yet actioned |
| Delivered | Delivery completed and confirmed |
| Skipped | Delivery skipped on customer request |
| Holiday | Delivery paused by admin (route holiday or operational reason) |
| Missed | Delivery was due but not completed (past date, still in Pending) |

**BR-DS-03 (Skip Request):** A customer shall be able to request a skip for any future pending delivery slot via WhatsApp. The admin marks the slot as Skipped. Skipped slots are not billed.

**BR-DS-04 (Admin Reschedule):** The admin shall be able to bulk-shift all pending delivery dates for a customer forward or backward by N days to accommodate route changes, holidays, or operational disruptions.

**BR-DS-05:** Delivered slots shall be immutable — once marked Delivered, the status and quantity cannot be changed. Any correction requires admin override with a logged reason.

**BR-DS-06:** The system shall display a visual calendar view of the 30-day schedule with colour-coded status indicators per slot.

**BR-DS-07:** The admin shall be able to mark all pending deliveries for the current day across all customers as delivered in a single bulk action.

**BR-DS-08:** The system shall automatically flag any slot whose scheduled date has passed while still in Pending status as Missed at the end of each day.

---

### 4.4 Partial-Day Delivery Slots

**BR-PD-01:** The system shall support **two delivery time bands per day** — Morning and Evening.

**BR-PD-02:** A customer's subscription plan shall specify which time band(s) apply:

| Configuration | Description |
|---------------|-------------|
| Morning only | One slot per day, delivered in the morning |
| Evening only | One slot per day, delivered in the evening |
| Both (morning + evening) | Two slots per day, each with its own quantity and status |

**BR-PD-03:** Each time-band slot shall carry an independent status — a customer may receive their morning delivery (Delivered) while the evening slot remains Pending or Skipped.

**BR-PD-04:** Each time-band slot shall carry its own quantity (e.g. 2 coconuts in the morning, 1 in the evening).

**BR-PD-05:** The admin shall be able to skip or reschedule individual time-band slots independently. Skipping an evening slot does not affect the morning slot on the same day.

**BR-PD-06:** For customers with both morning and evening slots, the daily delivery calendar shall display both slots side by side with independent status controls.

**BR-PD-07:** The invoice shall aggregate all slots (morning + evening) per day and present a daily total, along with a breakdown by time band when relevant.

---

### 4.5 Payment Management

**BR-PAY-01:** Payments can be collected in two modes:
- **Advance:** Customer pays for the full or partial subscription before delivery begins, or during the cycle.
- **On Credit (COD):** Customer pays at end of month or on collection.

**BR-PAY-02:** The billed amount per slot is computed as: *quantity delivered in that slot × price per coconut applicable on that date*.

**BR-PAY-03:** Since price and quantity can change mid-cycle, the billing engine shall apply the price and quantity that was active at the time of delivery for each slot individually.

**BR-PAY-04:** The system shall maintain a running ledger per customer showing: total billed (sum of all delivered slots at their applicable rates), total paid, and outstanding balance.

**BR-PAY-05:** Multiple payment entries shall be supported per customer per month (partial payments).

**BR-PAY-06:** Payment modes supported: Cash, UPI, Bank Transfer.

**BR-PAY-07:** The outstanding summary shall display all customers with their balance, colour-coded as Cleared (green), Low Due (amber), or High Due (red).

**BR-PAY-08:** Advance payments shall be held as credit in the customer ledger and automatically netted against billing at invoice time.

---

### 4.6 WhatsApp Communication Interface

**BR-WA-01:** WhatsApp shall be the primary customer-facing communication channel. Customers shall not be required to install any separate application.

**BR-WA-02:** All WhatsApp message templates shall be in **English** for Phase 1.

**BR-WA-03:** The system shall generate pre-written WhatsApp message templates for the following trigger events:

| Template | Trigger |
|----------|---------|
| Welcome / Onboarding | New customer registered |
| Delivery Confirmation | Delivery slot marked as delivered |
| Skip Acknowledgement | Skip request processed |
| Price / Quantity Change Notice | Admin updates price or quantity mid-cycle |
| Payment Reminder | Outstanding balance above threshold |
| Monthly Invoice | End of billing cycle |
| Renewal Reminder | Subscription within 5 days of expiry |

**BR-WA-04:** Each template shall be auto-populated with the customer's name, relevant dates, quantities, rates, and amounts.

**BR-WA-05:** The admin shall be able to copy any generated message to clipboard and send it via WhatsApp manually (Phase 1), with automated dispatch via WhatsApp Business API in Phase 2.

**BR-WA-06:** Customers shall be able to initiate skip requests by sending a WhatsApp message to the admin's business number. In Phase 2, these shall be parsed automatically.

---

### 4.7 Invoice & Reporting

**BR-INV-01:** The system shall generate a detailed invoice per customer covering the full 30-day subscription cycle.

**BR-INV-02:** The invoice shall include:
- Customer name, mobile number
- Delivery address for this subscription (label + full address)
- Invoice period (subscription start to end date)
- Date-wise delivery log showing:
  - Each day with morning and/or evening slot status
  - Quantity delivered per slot
  - Price per coconut applicable to that slot
  - Amount for that slot
- Total coconuts delivered (across all slots)
- Total skipped days / slots
- Any mid-cycle price or quantity changes with effective dates
- Total amount billed
- Total amount paid
- Net balance due or advance credit

**BR-INV-02A:** Where a customer has subscriptions across multiple addresses, a separate invoice shall be generated per address-subscription. A consolidated summary invoice across all addresses shall also be available.

**BR-INV-03:** The invoice shall be shareable via WhatsApp as a formatted text message or as a PDF attachment.

**BR-INV-04 (Admin Reports):** The admin dashboard shall display:
- Daily delivery completion rate (delivered vs. total scheduled)
- Revenue collected month-to-date
- Total outstanding across all customers
- Subscription expiry calendar (next 7 days)
- Customers with missed deliveries

---

## 5. Functional Requirements

### Module: Customer Registration

| ID | Requirement |
|----|-------------|
| FR-001 | Register customer with name, mobile, start date, payment mode |
| FR-001A | Add one or more named delivery addresses during registration (label + address text) |
| FR-001B | Designate one address as the primary address |
| FR-001C | Add, edit, or deactivate delivery addresses post-registration at any time |
| FR-002 | Set customer-specific default quantity per slot (e.g. 2 coconuts/slot) |
| FR-003 | Set customer-specific price per coconut at registration |
| FR-004 | Select delivery slot configuration: Morning only / Evening only / Both |
| FR-005 | Auto-generate 30-day delivery schedule on registration, linked to the selected delivery address |
| FR-006 | Send WhatsApp welcome message on registration (includes primary address) |
| FR-007 | List all customers with status badges, address count indicator, and quick actions |
| FR-008 | Edit customer contact details and manage addresses |
| FR-009 | Deactivate / remove customer |
| FR-010 | View customer 360 profile (all subscriptions by address, deliveries, payments, price history) |

### Module: Subscription & Plan Management

| ID | Requirement |
|----|-------------|
| FR-011 | Display active plan details (qty/slot, price/coconut, slot config) |
| FR-012 | Admin can update price per coconut mid-cycle; effective from date of change |
| FR-013 | Admin can update quantity per slot mid-cycle; effective from date of change |
| FR-014 | System logs all price and quantity changes with timestamp and old/new values |
| FR-015 | System sends WhatsApp price/quantity change notice to customer on update |
| FR-016 | Manual subscription renewal triggered by admin; no auto-renewal |
| FR-017 | System prompts admin when subscription is within 5 days of expiry |

### Module: Delivery Management

| ID | Requirement |
|----|-------------|
| FR-020 | Display 30-day calendar view per customer with morning / evening slots |
| FR-021 | Toggle individual slot status (pending → delivered → skipped → holiday) |
| FR-022 | Mark morning and evening slots independently per day |
| FR-023 | Mark today's slot as delivered (single customer, single time band) |
| FR-024 | Bulk-mark all pending slots for today across all customers as delivered |
| FR-025 | Process skip request for a specific slot (date + time band) |
| FR-026 | Bulk-reschedule all pending slots by N days (all slots, or per customer) |
| FR-027 | Prevent modification of delivered slots without admin override and reason log |
| FR-028 | Auto-flag overdue pending slots as Missed at end of day |
| FR-029 | Display delivery count, skipped count, missed count per customer on dashboard |

### Module: Payment Management

| ID | Requirement |
|----|-------------|
| FR-030 | Record payment with amount, date, and payment mode |
| FR-031 | Compute billing per slot using price applicable at time of delivery |
| FR-032 | Display outstanding balance per customer |
| FR-033 | Support partial and multiple payments per subscription cycle |
| FR-034 | Colour-coded payment status (cleared / low due / high due) |
| FR-035 | Net advance payments against billing automatically |

### Module: WhatsApp Messaging

| ID | Requirement |
|----|-------------|
| FR-040 | Generate delivery confirmation message (includes slot time band and quantity) |
| FR-041 | Generate skip acknowledgement message |
| FR-042 | Generate price / quantity change notice message |
| FR-043 | Generate monthly invoice message with delivery breakdown |
| FR-044 | Generate payment reminder message |
| FR-045 | Generate welcome / onboarding message |
| FR-046 | Generate renewal reminder message |
| FR-047 | One-tap copy to clipboard for WhatsApp pasting |
| FR-048 | (Phase 2) Auto-send via WhatsApp Business API on status change |

### Module: Invoice Generation

| ID | Requirement |
|----|-------------|
| FR-050 | Generate date-wise, slot-wise delivery log for the 30-day period for a specific address-subscription |
| FR-051 | Apply per-slot pricing (respects mid-cycle price changes) |
| FR-052 | Show morning / evening breakdown per day |
| FR-053 | Compute total billed, total paid, net balance per address-subscription |
| FR-053A | Generate consolidated summary invoice across all of a customer's address-subscriptions |
| FR-054 | Export individual or consolidated invoice as PDF |
| FR-055 | Share invoice text via WhatsApp (includes address label for clarity) |

---

## 6. Non-Functional Requirements

| Category | Requirement |
|----------|-------------|
| **Responsive UI** | Admin dashboard fully functional on desktop (≥1024px) and mobile browsers (≥320px); no separate app required |
| **Performance** | Dashboard loads within 2 seconds for up to 500 active customers |
| **Availability** | 99.5% uptime; delivery marking available offline (sync on reconnect) |
| **Scalability** | Support up to 1,000 customers, multiple slots per day per customer, 2.19M delivery slot records per year |
| **Audit Trail** | All price changes, quantity changes, and delivered-slot overrides logged with actor and timestamp |
| **Security** | Customer mobile numbers and financial data encrypted at rest (AES-256) |
| **Data Retention** | Delivery and payment records retained for 3 years |
| **WhatsApp Compliance** | Message templates comply with WhatsApp Business Policy; English only for Phase 1 |
| **Backup** | Daily automated database backup with 30-day retention |
| **Browser Support** | Chrome, Safari, Firefox — latest 2 major versions; Android Chrome; iOS Safari |

---

## 7. Business Rules

| Rule ID | Rule |
|---------|------|
| BR-001 | Only slots with status "Delivered" are included in billing |
| BR-002 | Skipped and Holiday slots are not billed |
| BR-003 | Once a slot is marked Delivered, it cannot be changed without an admin override accompanied by a logged reason |
| BR-004 | Price changes mid-cycle apply only to slots delivered on or after the effective date; past delivered slots are billed at their original price |
| BR-005 | Quantity changes mid-cycle apply only to slots delivered on or after the effective date |
| BR-006 | A billing ledger entry is created per slot at the time of marking Delivered, capturing qty and price at that moment |
| BR-007 | A skip request can only be raised for future pending slots; past and delivered slots cannot be skipped |
| BR-008 | Bulk reschedule applies only to Pending slots; Delivered, Skipped, and Holiday slots are unaffected |
| BR-009 | Payment outstanding = Total Delivered Value (slot-level) − Total Payments Received |
| BR-010 | Subscription renewal is always manual and admin-triggered; auto-renewal is not supported |
| BR-011 | Morning and Evening slots on the same day are independent — each can be in a different status |
| BR-012 | Advance payments are credited to the customer ledger and netted at invoice time |
| BR-013 | A new 30-day schedule is generated only on explicit manual renewal by the admin |
| BR-014 | WhatsApp messages must include the customer's name in every communication |
| BR-015 | System must prompt admin 5 days before subscription expiry; no automated renewal action is taken |
| BR-016 | Each subscription is linked to exactly one delivery address; a customer may have multiple active subscriptions if they have multiple active addresses |
| BR-017 | Outstanding balance is computed per subscription (per address); consolidated view is available but payment recording is per subscription |
| BR-018 | Deactivating a delivery address does not cancel its active subscription; admin must explicitly cancel the subscription separately |
| BR-019 | A delivery address that has never been linked to a subscription can be deleted; one with historical records can only be deactivated |

---

## 8. User Journeys

### Journey 1 — New Customer Onboarding (Multiple Addresses, Both Slots)

```
Admin opens Customer Registration
→ Enters name, mobile, start date, payment mode
→ Adds Address 1: label "Home", full address, marks as primary
→ Adds Address 2: label "Office"
→ Configures plan for Address 1 (Home): 2 coconuts/slot, ₹30/coconut, Both slots
→ Configures plan for Address 2 (Office): 1 coconut/slot, ₹32/coconut, Morning only
→ System generates two separate 30-day schedules (one per address-subscription)
→ System generates WhatsApp welcome message listing both delivery addresses
→ Admin copies message → Sends to customer on WhatsApp
→ Customer receives welcome with subscription details per address
```

### Journey 2 — Daily Delivery Workflow (Morning Slot)

```
Admin opens Dashboard → Views today's delivery list
→ Morning route completed → Admin marks morning slots as Delivered
→ Evening route pending → Evening slots remain Pending
→ System generates WhatsApp delivery confirmation (morning, qty, date)
→ Admin sends confirmation to customer
```

### Journey 3 — Customer Skip Request (Evening Slot Only)

```
Customer messages admin: "Please skip evening delivery tomorrow"
→ Admin opens Schedule for that customer → Identifies tomorrow's evening slot
→ Marks the evening slot as Skipped (morning slot on same day is unaffected)
→ System generates skip acknowledgement for evening slot
→ Admin sends acknowledgement to customer
→ That slot is excluded from billing; morning slot billed normally
```

### Journey 4 — Mid-Cycle Price Change

```
Admin negotiates new price with customer (e.g. ₹28 → ₹32)
→ Opens Customer Profile → Updates price per coconut with effective date
→ System logs old price (₹28) and new price (₹32) with timestamp
→ All past delivered slots remain billed at ₹28
→ All future slots billed at ₹32 from effective date
→ System generates WhatsApp price change notice
→ Admin sends notice to customer
```

### Journey 5 — Mid-Cycle Quantity Change

```
Customer requests increase: "Please send 3 coconuts instead of 2 from next week"
→ Admin opens Customer Profile → Updates quantity per slot from effective date
→ System logs old qty (2) and new qty (3) with timestamp
→ All future pending slots will be delivered and billed at 3 coconuts
→ System generates WhatsApp quantity change notice
→ Admin sends confirmation to customer
```

### Journey 6 — Month-End Invoice & Payment

```
End of 30-day cycle → Admin opens Invoice tab → Selects customer
→ System generates date-wise, slot-wise delivery log
→ Each slot billed at its own applicable price and quantity
→ Total billed = sum of all slot-level billing entries
→ Admin reviews → Copies WhatsApp invoice message
→ Customer receives invoice with delivery breakdown
→ Customer pays → Admin records payment
→ Balance reconciled (advance credit netted if applicable)
```

### Journey 7 — Subscription Renewal

```
System detects subscription end date within 5 days
→ Admin receives prompt on dashboard: "Customer X subscription expires in 3 days"
→ Admin confirms renewal with customer (via WhatsApp)
→ Admin clicks Renew → New 30-day schedule generated from next day
→ System sends WhatsApp renewal confirmation to customer
→ Previous cycle closed; outstanding balance carried forward to new cycle if unpaid
```

### Journey 8 — Route Holiday / Bulk Reschedule

```
Admin learns of a 2-day gap in delivery operations
→ Opens Schedule → Applies bulk reschedule across all customers: shift +2 days
→ All pending slots across all customers shift forward by 2 days
→ Delivered, Skipped, Holiday slots are unaffected
→ Admin notifies customers via WhatsApp (bulk message copy)
```

---

## 9. Technical Architecture

### 9.1 Architecture Overview

The platform is a **responsive Progressive Web App (PWA)** with a REST API backend, optimised for a single admin operator. The architecture is mobile-first responsive — the admin dashboard renders correctly on both desktop and mobile browsers without a separate native app.

```
┌────────────────────────────────────────────────────────────────┐
│                        CUSTOMER LAYER                          │
│                 WhatsApp (Business API / Manual)               │
└───────────────────────────┬────────────────────────────────────┘
                            │ Inbound skip requests / queries
                            │ Outbound confirmations / invoices
┌───────────────────────────▼────────────────────────────────────┐
│                         ADMIN LAYER                            │
│         Progressive Web App — React + Next.js (Responsive)     │
│  ┌───────────┐ ┌──────────┐ ┌──────────┐ ┌────────┐ ┌──────┐  │
│  │ Dashboard │ │ Schedule │ │ Payments │ │ WA Hub │ │ Inv. │  │
│  └───────────┘ └──────────┘ └──────────┘ └────────┘ └──────┘  │
└───────────────────────────┬────────────────────────────────────┘
                            │ REST API (HTTPS / JWT)
┌───────────────────────────▼────────────────────────────────────┐
│                      APPLICATION LAYER                         │
│               Node.js 20 LTS / Fastify Backend                 │
│  ┌─────────┐ ┌──────────┐ ┌─────────┐ ┌────────┐ ┌────────┐   │
│  │Customer │ │ Delivery │ │ Payment │ │Invoice │ │  WA   │   │
│  │ Service │ │ Service  │ │ Service │ │Service │ │Service│   │
│  └─────────┘ └──────────┘ └─────────┘ └────────┘ └────────┘   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │          Scheduler (node-cron) — missed slot flagging,   │  │
│  │          renewal reminders, payment reminders            │  │
│  └──────────────────────────────────────────────────────────┘  │
└───────────────────────────┬────────────────────────────────────┘
                            │
┌───────────────────────────▼────────────────────────────────────┐
│                        DATA LAYER                              │
│          PostgreSQL 15 (primary) + Redis 7 (cache)             │
└────────────────────────────────────────────────────────────────┘
```

---

### 9.2 System Components

#### 9.2.1 Frontend — Progressive Web App (Responsive)

| Attribute | Detail |
|-----------|--------|
| Framework | React 18 + Next.js 14 (App Router) |
| UI Library | Tailwind CSS + shadcn/ui |
| Responsive Strategy | Mobile-first CSS; breakpoints at 640px, 1024px, 1280px |
| State Management | Zustand (local) + React Query (server state) |
| Offline Support | Service Worker + IndexedDB for delivery slot marking offline; sync on reconnect |
| PWA | Installable on Android Chrome and iOS Safari home screen |
| Hosting | Vercel (recommended) or DigitalOcean App Platform |

**Responsive layout strategy:**

| Screen | Layout |
|--------|--------|
| Mobile (< 640px) | Single column; calendar replaces grid with swipe-scroll; floating action button for bulk-deliver |
| Tablet (640–1023px) | Two-column; collapsible sidebar |
| Desktop (≥ 1024px) | Full three-panel layout with persistent sidebar |

**Key screens:**

- Dashboard — metrics, today's morning and evening delivery lists, activity log
- Customer Registry — list, add, edit, deactivate, 360 profile view
- Delivery Schedule — calendar view with morning/evening slots, toggle status, skip, reschedule
- Plan Management — view/edit price, quantity, slot config; price/quantity history log
- Payment Ledger — record payments, view outstanding per customer
- WhatsApp Hub — select customer, select template, copy message
- Invoice Generator — date+slot-wise log, PDF export

#### 9.2.2 Backend — API Server

| Attribute | Detail |
|-----------|--------|
| Runtime | Node.js 20 LTS |
| Framework | Fastify (high performance, schema-first) |
| API Style | REST v1 |
| Auth | JWT (admin) + API Key (WhatsApp webhook) |
| PDF Generation | Puppeteer (headless Chrome) — renders invoice HTML to PDF server-side |
| Job Scheduler | node-cron: daily Missed flagging (23:59), renewal reminders (D-5), payment reminders (configurable threshold) |
| Validation | Zod schema validation on all request/response bodies |

**Core services:**

| Service | Responsibility |
|---------|---------------|
| `CustomerService` | CRUD, subscription lifecycle, plan configuration |
| `ScheduleService` | Schedule generation, slot status updates, bulk reschedule, missed-slot flagging |
| `PricingService` | Mid-cycle price and quantity change handling, pricing history, slot-level billing computation |
| `PaymentService` | Payment recording, ledger computation, outstanding calculation |
| `InvoiceService` | Slot-aggregated invoice computation, PDF generation |
| `WhatsAppService` | Template rendering with variable substitution, Phase 2 API dispatch |
| `NotificationService` | Cron-driven renewal and payment reminders |

#### 9.2.3 Database — PostgreSQL 15

Primary relational store. Full schema in Section 9.3.

#### 9.2.4 Cache — Redis 7

| Use Case | TTL |
|----------|-----|
| Today's delivery slot list (all customers) | 5 minutes |
| Customer profile + active plan | 30 minutes |
| Invoice computation result | 60 minutes |
| WhatsApp template renders | 60 minutes |

Cache is invalidated on any write to the relevant customer or slot records.

---

### 9.3 Data Architecture

#### Entity Relationship Overview

```
CUSTOMER (1) ──────────── (N) CUSTOMER_ADDRESS
CUSTOMER_ADDRESS (1) ────── (N) SUBSCRIPTION
SUBSCRIPTION (1) ────────── (N) DELIVERY_SLOT
SUBSCRIPTION (1) ────────── (N) PLAN_CHANGE_LOG
DELIVERY_SLOT (1) ─────────── (1) BILLING_ENTRY  [created on Delivered]
CUSTOMER (1) ──────────── (N) PAYMENT
SUBSCRIPTION (1) ────────── (1) INVOICE  [per cycle, generated on demand]
DELIVERY_SLOT (1) ─────────── (N) WA_MESSAGE_LOG
```

#### Table: `customers`

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| `id` | UUID | PK | System-generated |
| `customer_code` | VARCHAR(10) | UNIQUE NOT NULL | e.g. CCF-001 |
| `name` | VARCHAR(100) | NOT NULL | |
| `mobile` | VARCHAR(15) | UNIQUE NOT NULL | WhatsApp number |
| `primary_address_id` | UUID | FK → customer_addresses NULLABLE | Set after first address is created |
| `status` | ENUM | NOT NULL | active, paused, churned |
| `created_at` | TIMESTAMPTZ | NOT NULL DEFAULT now() | |
| `updated_at` | TIMESTAMPTZ | | |

#### Table: `customer_addresses`

Stores all named delivery addresses for a customer. One customer may have many addresses.

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| `id` | UUID | PK | System-generated |
| `customer_id` | UUID | FK → customers NOT NULL | |
| `label` | VARCHAR(50) | NOT NULL | e.g. Home, Office, Parents' House |
| `address_line` | TEXT | NOT NULL | Full delivery address text |
| `landmark` | VARCHAR(100) | | Optional nearby landmark |
| `status` | ENUM | NOT NULL DEFAULT 'active' | active, inactive |
| `created_at` | TIMESTAMPTZ | NOT NULL DEFAULT now() | |
| `updated_at` | TIMESTAMPTZ | | |

> A customer must have at least one active address at all times. The last active address cannot be deactivated while a subscription linked to it is active.

> Circular FK note: `customers.primary_address_id` → `customer_addresses.id` and `customer_addresses.customer_id` → `customers.id`. Handle by inserting customer first (primary_address_id = NULL), then inserting address, then updating primary_address_id. Use DEFERRABLE INITIALLY DEFERRED on the FK constraint.

#### Table: `subscriptions`

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| `id` | UUID | PK | |
| `customer_id` | UUID | FK → customers NOT NULL | |
| `address_id` | UUID | FK → customer_addresses NOT NULL | Delivery address for this subscription |
| `start_date` | DATE | NOT NULL | |
| `end_date` | DATE | NOT NULL | start_date + 29 |
| `total_days` | INT | NOT NULL DEFAULT 30 | |
| `payment_mode` | ENUM | NOT NULL | advance, cod |
| `status` | ENUM | NOT NULL | active, completed, cancelled |
| `created_at` | TIMESTAMPTZ | NOT NULL DEFAULT now() | |

> A customer may have multiple active subscriptions concurrently, provided each is linked to a distinct delivery address.

#### Table: `subscription_plans`

Captures the current active plan for a subscription. Changes create new rows via `plan_change_log`.

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| `id` | UUID | PK | |
| `subscription_id` | UUID | FK → subscriptions NOT NULL | |
| `effective_from` | DATE | NOT NULL | Date from which this plan applies |
| `price_per_unit` | NUMERIC(8,2) | NOT NULL | Price per coconut |
| `morning_qty` | INT | NOT NULL DEFAULT 0 | Coconuts per morning slot (0 = no morning slot) |
| `evening_qty` | INT | NOT NULL DEFAULT 0 | Coconuts per evening slot (0 = no evening slot) |
| `created_by` | VARCHAR(50) | | Admin user who created this plan version |
| `created_at` | TIMESTAMPTZ | NOT NULL DEFAULT now() | |
| `notes` | TEXT | | Reason for change |

> The active plan for a given date is the row with the highest `effective_from` date ≤ that date.

#### Table: `plan_change_log`

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID PK | |
| `subscription_id` | UUID FK | → subscriptions |
| `changed_at` | TIMESTAMPTZ | |
| `changed_by` | VARCHAR(50) | Admin user |
| `field_changed` | ENUM | price_per_unit, morning_qty, evening_qty |
| `old_value` | TEXT | Previous value |
| `new_value` | TEXT | New value |
| `effective_from` | DATE | Date change takes effect |

#### Table: `delivery_slots`

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| `id` | UUID | PK | |
| `subscription_id` | UUID | FK NOT NULL | → subscriptions |
| `customer_id` | UUID | FK NOT NULL | Denormalised for query speed |
| `address_id` | UUID | FK NOT NULL | → customer_addresses; denormalised for route grouping |
| `scheduled_date` | DATE | NOT NULL | Original scheduled date |
| `actual_date` | DATE | | Actual delivery date (post-reschedule) |
| `time_band` | ENUM | NOT NULL | morning, evening |
| `status` | ENUM | NOT NULL DEFAULT 'pending' | pending, delivered, skipped, holiday, missed |
| `qty_ordered` | INT | NOT NULL | Quantity from active plan at slot creation |
| `qty_delivered` | INT | | Actual quantity delivered (set on Delivered) |
| `price_at_delivery` | NUMERIC(8,2) | | Price per unit locked at time of Delivered |
| `marked_by` | VARCHAR(50) | | Admin user or 'system' |
| `marked_at` | TIMESTAMPTZ | | When status was last changed |
| `override_reason` | TEXT | | Required if admin overrides a Delivered slot |
| `notes` | TEXT | | Optional remarks |

#### Table: `billing_entries`

Created automatically when a slot is marked Delivered. Immutable.

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID PK | |
| `delivery_slot_id` | UUID FK UNIQUE | → delivery_slots (1:1) |
| `customer_id` | UUID FK | |
| `subscription_id` | UUID FK | |
| `address_id` | UUID FK | → customer_addresses; for address-level billing aggregation |
| `delivery_date` | DATE | |
| `time_band` | ENUM | morning, evening |
| `qty_delivered` | INT | |
| `price_per_unit` | NUMERIC(8,2) | Price locked at delivery |
| `line_amount` | NUMERIC(10,2) | qty_delivered × price_per_unit |
| `created_at` | TIMESTAMPTZ | |

#### Table: `payments`

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID PK | |
| `customer_id` | UUID FK | |
| `subscription_id` | UUID FK | |
| `amount` | NUMERIC(10,2) | |
| `payment_date` | DATE | |
| `payment_mode` | ENUM | cash, upi, bank_transfer |
| `reference` | VARCHAR(100) | UPI transaction ID, cheque no., etc. |
| `recorded_by` | VARCHAR(50) | Admin user |
| `created_at` | TIMESTAMPTZ | |

#### Table: `wa_message_log`

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID PK | |
| `customer_id` | UUID FK | |
| `template_type` | VARCHAR(50) | confirm, skip, invoice, price_change, qty_change, reminder, renewal, welcome |
| `message_body` | TEXT | Full rendered message |
| `sent_at` | TIMESTAMPTZ | |
| `delivery_status` | ENUM | generated, sent, delivered, failed |
| `wa_message_id` | VARCHAR(100) | WhatsApp API message ID (Phase 2) |

#### Key Indexes

```sql
-- Address lookups
CREATE INDEX idx_addresses_customer   ON customer_addresses(customer_id, status);

-- Delivery slot lookups
CREATE INDEX idx_slots_date_status    ON delivery_slots(actual_date, status);
CREATE INDEX idx_slots_customer_date  ON delivery_slots(customer_id, actual_date, time_band);
CREATE INDEX idx_slots_address_date   ON delivery_slots(address_id, actual_date, status);
CREATE INDEX idx_slots_subscription   ON delivery_slots(subscription_id, status);

-- Billing
CREATE INDEX idx_billing_customer     ON billing_entries(customer_id, subscription_id);
CREATE INDEX idx_billing_address      ON billing_entries(address_id, delivery_date);
CREATE INDEX idx_billing_date         ON billing_entries(delivery_date);

-- Payments
CREATE INDEX idx_payments_customer    ON payments(customer_id, subscription_id);

-- Plan versioning
CREATE INDEX idx_plans_sub_date       ON subscription_plans(subscription_id, effective_from DESC);

-- Change log
CREATE INDEX idx_change_log_sub       ON plan_change_log(subscription_id, changed_at DESC);
```

---

### 9.4 Integration Architecture

#### Phase 1 — Manual WhatsApp (Copy-Paste)

```
Admin Dashboard
      │
      ▼
Template Engine (server-side rendering with customer variables)
      │
      ▼
Rendered Message displayed in WhatsApp Hub
      │
      ▼
Admin clicks "Copy" → Message copied to clipboard
      │
      ▼
Admin opens WhatsApp on phone → Pastes into customer chat → Sends
```

No API dependency in Phase 1. Zero marginal cost per message.

#### Phase 2 — WhatsApp Business API (Automated)

```
Trigger event (slot delivered, payment due, renewal approaching)
      │
      ▼
WhatsApp Service — renders approved Meta template with variables
      │
      ▼
POST https://graph.facebook.com/v19.0/{phone_number_id}/messages
Headers: Authorization: Bearer {WABA_ACCESS_TOKEN}
Body: {
  "messaging_product": "whatsapp",
  "to": "{customer_mobile}",
  "type": "template",
  "template": {
    "name": "{template_name}",
    "language": { "code": "en" },
    "components": [{ "type": "body", "parameters": [...] }]
  }
}
      │
      ▼
Response: wa_message_id → stored in wa_message_log
      │
      ▼
Status webhook (POST /api/webhooks/whatsapp/status)
→ Updates wa_message_log.delivery_status
```

**Inbound message handling (Phase 2):**

```
Customer sends WhatsApp message to business number
      │
      ▼
Meta webhook → POST /api/webhooks/whatsapp/inbound
      │ (verified via X-Hub-Signature-256)
      ▼
Intent Detection
      ├── "skip" / "no delivery" / date keyword
      │     → Parse date → Match customer by mobile
      │     → Mark slot Skipped → Send acknowledgement
      │
      ├── "invoice" / "bill" / "how much"
      │     → Generate invoice summary → Send via API
      │
      ├── "balance" / "outstanding"
      │     → Compute and reply with current balance
      │
      └── Unrecognised → Flag in admin dashboard for manual reply
```

---

### 9.5 WhatsApp Integration Design

#### Message Template Specifications

All templates submitted to Meta for approval. Variables shown as `{{N}}`.

**Template: `delivery_confirmation`**

```
Hello {{1}},

Your coconut delivery has been completed.

Date: {{2}}
Time: {{3}} ({{4}} slot)
Quantity delivered: {{5}} coconuts

Deliveries this month: {{6}} of {{7}}

Thank you!
— CocoFresh
```
Variables: [customer_name, date, time_of_day, time_band_label, qty_delivered, total_delivered_count, total_subscription_days]

**Template: `skip_acknowledgement`**

```
Hello {{1}},

Your skip request for the {{2}} delivery on {{3}} has been noted. No delivery will be made.

{{4}} of your 30 deliveries remain scheduled.

Thank you!
— CocoFresh
```
Variables: [customer_name, time_band_label, skip_date, remaining_pending_count]

**Template: `price_change_notice`**

```
Hello {{1}},

Your coconut subscription rate has been updated.

Old rate: ₹{{2}} per coconut
New rate: ₹{{3}} per coconut
Effective from: {{4}}

Your previous deliveries are billed at the old rate.

— CocoFresh
```
Variables: [customer_name, old_price, new_price, effective_date]

**Template: `quantity_change_notice`**

```
Hello {{1}},

Your daily coconut quantity has been updated.

Old quantity: {{2}} per delivery
New quantity: {{3}} per delivery
Effective from: {{4}}

— CocoFresh
```
Variables: [customer_name, old_qty, new_qty, effective_date]

**Template: `monthly_invoice`**

```
Hello {{1}},

Your invoice for {{2}} to {{3}}:

Coconuts delivered: {{4}}
Skipped deliveries: {{5}}
Total billed: ₹{{6}}
Amount paid: ₹{{7}}
Balance due: ₹{{8}}

Detailed invoice shared separately.

— CocoFresh
```
Variables: [customer_name, start_date, end_date, total_delivered, total_skipped, total_billed, total_paid, balance_due]

**Template: `renewal_reminder`**

```
Hello {{1}},

Your CocoFresh subscription expires on {{2}} ({{3}} days remaining).

Please confirm renewal to continue your daily deliveries without interruption.

— CocoFresh
```
Variables: [customer_name, expiry_date, days_remaining]

---

### 9.6 Infrastructure & Deployment

#### Recommended Stack

| Layer | Technology | Provider |
|-------|-----------|----------|
| Frontend Hosting | Next.js on Vercel | Vercel |
| Backend API | Node.js Fastify container | DigitalOcean App Platform |
| Database | PostgreSQL 15 Managed | DigitalOcean Managed DB |
| Cache | Redis 7 Managed | DigitalOcean Managed Redis |
| PDF Generation | Puppeteer (server-side headless Chrome) | Backend container |
| WhatsApp API | Meta Cloud API v19.0 | Meta for Developers |
| Domain & SSL | Custom domain + Cloudflare proxy | Cloudflare (free SSL) |
| Monitoring | Uptime + error tracking | UptimeRobot + Sentry (free tier) |
| Backup | Automated daily + point-in-time recovery | DigitalOcean Managed DB |

#### Estimated Monthly Infrastructure Cost (Phase 1)

| Service | Plan | Est. Cost |
|---------|------|-----------|
| Vercel (frontend) | Pro (for team features) | ~₹1,700/month |
| DigitalOcean App (backend) | Basic 1GB RAM | ~₹1,200/month |
| DigitalOcean Managed DB | 1GB RAM, 10GB storage | ~₹1,600/month |
| DigitalOcean Redis | Managed | ~₹800/month |
| Domain (.in) | Annual | ~₹70/month amortised |
| **Total Phase 1** | | **~₹5,370/month** |

#### Phase 2 Additional Costs

| Service | Basis | Est. Cost |
|---------|-------|-----------|
| WhatsApp Business API | Meta Cloud API (free up to 1,000 conversations/month) | ₹0–₹2,000/month depending on volume |
| Backend upgrade (Puppeteer + API load) | 2GB RAM | +₹800/month |

---

## 10. Data Dictionary

| Term | Definition |
|------|-----------|
| Subscription | A 30-day agreement for daily coconut delivery at a specific address under a customer-specific plan |
| Customer Address | A named delivery location registered under a customer (e.g. Home, Office). A customer may have multiple addresses |
| Primary Address | The default address shown in customer listings and used in WhatsApp communications when no specific address is referenced |
| Address Label | A short human-readable name for a delivery address (e.g. "Home", "Office", "Parents' House") |
| Subscription Plan | The active configuration of qty/slot, price/coconut, and time-band for a subscription; versioned to support mid-cycle changes |
| Delivery Slot | A single time-band delivery entry (morning or evening) for a specific date and address within a subscription |
| Time Band | The time of day for a delivery — Morning or Evening |
| Pending | A delivery slot due but not yet actioned |
| Delivered | A delivery slot confirmed as completed; triggers a billing entry |
| Skipped | A slot cancelled on customer request; not billed |
| Holiday | A slot paused by admin; not billed |
| Missed | A past pending slot auto-flagged at end of day; treated as unbilled |
| Billing Entry | An immutable record created when a slot is marked Delivered, capturing address, qty, and price at that moment |
| Line Amount | qty_delivered × price_per_unit for a single billing entry |
| Billing Amount | Sum of all line amounts across delivered slots in a subscription |
| Consolidated Invoice | An invoice aggregating all address-subscriptions for a single customer into one summary document |
| Outstanding | Billing Amount − Total Payments Received, computed per subscription or consolidated across all subscriptions |
| Plan Change | Admin-initiated update to price or quantity mid-cycle; versioned by effective date |
| Advance Payment | Payment received before or during the cycle, held as credit and netted at invoice |
| COD / Credit | Payment expected at end of cycle or on collection |
| WhatsApp Template | A Meta-approved message format with variable placeholders for customer-specific data |
| Renewal | Admin-triggered creation of a new 30-day subscription for an existing customer at a given address |

---

## 11. API Specification

### Base URL

```
https://api.cocofresh.in/v1
```

### Authentication

All endpoints require `Authorization: Bearer <JWT_TOKEN>` header. Token issued on admin login; expires in 1 hour; refresh token valid for 30 days.

### Customer APIs

```
POST   /customers                           Register new customer
GET    /customers                           List all (with plan summary + outstanding per address)
GET    /customers/:id                       Full 360 profile (all addresses + subscriptions)
PUT    /customers/:id                       Update contact details
PATCH  /customers/:id/status                Change status (active/paused/churned)
DELETE /customers/:id                       Deactivate customer

POST   /customers/:id/addresses             Add new delivery address
GET    /customers/:id/addresses             List all addresses for a customer
PUT    /customers/:id/addresses/:addrId     Edit address label or text
PATCH  /customers/:id/addresses/:addrId     Activate / deactivate address
PATCH  /customers/:id/primary-address       Set primary address
```

### Subscription & Plan APIs

```
POST   /customers/:id/subscriptions              Create new subscription (requires address_id in body)
GET    /customers/:id/subscriptions              List all subscriptions (grouped by address)
GET    /subscriptions/:subId                     Get subscription detail (includes address)
PATCH  /subscriptions/:subId/plan/price          Update price per coconut (mid-cycle)
PATCH  /subscriptions/:subId/plan/quantity       Update qty per slot (mid-cycle)
GET    /subscriptions/:subId/plan/history        Get full price + qty change log
```

### Delivery Slot APIs

```
GET    /customers/:id/schedule               Get 30-day slot schedule
PATCH  /delivery-slots/:slotId/status        Update single slot status
POST   /customers/:id/skip                   Mark specific date + time_band as skipped
POST   /customers/:id/reschedule             Bulk-shift pending slots by N days
POST   /deliveries/bulk-deliver              Mark all today's pending slots delivered
GET    /deliveries/today                     All slots scheduled for today (all customers)
```

### Payment APIs

```
POST   /payments                             Record payment
GET    /customers/:id/payments               Payment history
GET    /payments/outstanding                 Outstanding summary (all customers)
```

### Invoice APIs

```
GET    /customers/:id/invoice                     Consolidated invoice across all address-subscriptions
GET    /subscriptions/:subId/invoice              Invoice for a specific address-subscription
POST   /subscriptions/:subId/invoice/pdf          Generate and return PDF for one subscription (multipart)
POST   /customers/:id/invoice/pdf/consolidated    Generate consolidated PDF across all subscriptions
```

### WhatsApp APIs

```
GET    /whatsapp/template?customerId=&type=  Render template
POST   /whatsapp/send                        (Phase 2) Dispatch via Meta API
POST   /webhooks/whatsapp                    (Phase 2) Inbound messages + status updates
```

### Scheduler APIs (Internal)

```
POST   /internal/cron/flag-missed            Flag overdue pending slots as Missed
POST   /internal/cron/renewal-alerts         Send renewal reminders (D-5)
POST   /internal/cron/payment-reminders      Send payment reminders (configurable threshold)
```

---

## 12. Security & Compliance

### Authentication & Authorisation

- Admin login via email/password with JWT (access: 1 hour, refresh: 30 days)
- bcrypt password hashing (cost factor 12)
- Phase 1: single admin role. Phase 2: role-based access control (Owner / Agent)
- All API endpoints require valid JWT; webhook endpoints use API key + HMAC verification

### Data Security

- Customer mobile numbers, addresses, and financial data encrypted at rest (AES-256)
- TLS 1.3 enforced on all endpoints
- WhatsApp webhook payloads verified via X-Hub-Signature-256 before processing
- No customer PII stored in application logs
- Pricing change audit trail retained for 3 years

### WhatsApp Compliance

- Only Meta-approved templates used for proactive (business-initiated) messages
- Customer opt-in recorded before adding to WhatsApp communications
- Opt-out ("STOP") handling removes customer from automated messaging; logged
- 24-hour session window respected for free-form messages

### Backup & Recovery

| Metric | Target |
|--------|--------|
| Recovery Time Objective (RTO) | 4 hours |
| Recovery Point Objective (RPO) | 24 hours |
| Backup frequency | Daily automated + point-in-time recovery (1-minute granularity) |
| Backup retention | 30 days |

---

## 13. Implementation Roadmap

### Phase 1 — Core Platform (Weeks 1–8)

| Week | Deliverable |
|------|-------------|
| 1 | Database schema: all tables including `customer_addresses`, indexes, constraints, circular FK deferral; seed data; dev environment |
| 2 | Customer registration with multi-address management (add / edit / deactivate / set primary); address-linked subscription creation |
| 3 | 30-day schedule generation with morning + evening slots; calendar UI (responsive) |
| 4 | Slot status management — toggle, skip, bulk-deliver, bulk-reschedule |
| 5 | Mid-cycle price and quantity change with audit log; pricing history screen |
| 6 | Payment recording, billing entry engine (slot-level), outstanding ledger |
| 7 | WhatsApp template engine — all 7 templates; copy-to-clipboard hub |
| 8 | Invoice generation (slot-wise, plan-change-aware, per-address + consolidated); PDF export; dashboard completion; end-to-end testing |

**Go-live criteria:** FR-001 through FR-055 satisfied; responsive on mobile and desktop.

### Phase 2 — WhatsApp Automation (Weeks 9–12)

| Week | Deliverable |
|------|-------------|
| 9 | WhatsApp Business API integration; outbound template sending on key events |
| 10 | Inbound webhook; intent detection for skip, balance, invoice requests |
| 11 | Auto-send delivery confirmation on slot status change; payment reminder cron |
| 12 | Status tracking (sent / delivered / read); testing and Meta template approval |

### Phase 3 — Scale & Delivery Agent App (Weeks 13–20)

| Week | Deliverable |
|------|-------------|
| 13–14 | Delivery agent mobile app (React Native PWA) — route view, mark slots delivered |
| 15–16 | Multi-route / multi-agent support; GPS-based delivery proof |
| 17 | Online payment collection (Razorpay UPI link via WhatsApp) |
| 18 | Analytics dashboard — delivery performance, revenue trends, churn signals |
| 19 | Multi-language template support (Hindi, Tamil, etc.) |
| 20 | Load testing (500+ customers), performance tuning, production hardening |

---

## 14. Resolved Decisions & Remaining Assumptions

### Resolved in v1.2

| # | Decision | Resolution |
|---|----------|-----------|
| 1 | Admin UI: desktop or mobile? | Both — fully responsive PWA; no separate app |
| 2 | Mid-cycle price change? | Yes — supported with per-slot billing and audit log |
| 3 | Multi-unit plans? | Yes — customer-specific qty per slot (morning / evening), versioned |
| 4 | Auto-renewal? | No auto-renewal; manual admin-triggered only; renewal prompt at D-5 |
| 5 | Partial-day delivery slots? | Provisioned — Morning and Evening as independent slots with independent status and qty |
| 6 | Multi-language WhatsApp? | English only for Phase 1; multi-language provisioned for Phase 3 |
| 7 | Multiple delivery addresses per customer? | Yes — fully supported in Phase 1; each address has its own subscription, plan, schedule, and invoice; consolidated invoice available |

### Remaining Assumptions

| # | Assumption | Owner |
|---|-----------|-------|
| 1 | Admin will have a WhatsApp Business account active before Phase 2 go-live | Admin |
| 2 | Meta Business Verification for WhatsApp API may take 4–8 weeks; Phase 2 timeline adjusts accordingly | Admin + Dev |
| 3 | Subscription price is in Indian Rupees (INR); multi-currency not in scope | Admin |
| 4 | A customer can have at most one active subscription per address at any given time | Admin |
| 5 | The admin is the sole operator of the dashboard in Phase 1; multi-user / multi-agent access is a Phase 3 feature | Admin |
| 6 | PDF invoice is generated server-side; Puppeteer container requires at least 1GB RAM | Dev |

---

*Document: CocoFresh Distribution Platform BRD · Version 1.2 · April 2026*  
*Supersedes Version 1.1*
