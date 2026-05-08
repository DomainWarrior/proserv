# ProServ

> Full-stack booking & business management platform for local service companies.

![Next.js](https://img.shields.io/badge/Next.js-14-000000?style=flat-square&logo=nextdotjs)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=flat-square&logo=supabase)
![Stripe](https://img.shields.io/badge/Stripe-Payments-635BFF?style=flat-square&logo=stripe)
![Vercel](https://img.shields.io/badge/Deployed-Vercel-000000?style=flat-square&logo=vercel)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)

---

## Overview

ProServ is a production-ready web application built for lawn care, cleaning, HVAC, and similar local service businesses. It covers the full customer lifecycle — from public marketing pages and online booking to Stripe payments, automated SMS reminders, Google Calendar sync, and a full admin dashboard.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router, Server Actions) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Auth & Database | Supabase (PostgreSQL + Row-Level Security) |
| Payments | Stripe (PaymentIntents + Webhooks) |
| SMS | Twilio |
| Calendar | Google Calendar API (OAuth 2.0) |
| Weather | Open-Meteo (free, no key) |
| Email | Resend |
| Deployment | Vercel (with cron jobs) |

---

## Features

### Public Website
- Responsive hero with click-to-call
- Service cards with live pricing tiers
- Before/after image gallery
- Animated testimonials carousel
- Quote request form (saved to Supabase)
- FAQ accordion
- Dark mode + live chat widget

### Customer Portal
- Secure signup/login (Supabase Auth)
- View, reschedule, and cancel appointments
- Full calendar view with real-time weather (Open-Meteo)
- Service history & invoices
- Notification center
- Profile & password management
- SMS/email notification preferences
- Google Calendar sync (OAuth 2.0)

### Admin Dashboard
- Revenue, jobs, ratings, and customer analytics
- Revenue bar charts (Recharts)
- Appointment approval & worker assignment
- Customer and worker management
- Business settings panel
- Integration manager (Stripe, Twilio, Google, Resend)

### Integrations
- **Stripe** — PaymentIntent, webhooks, auto-confirm on payment
- **Twilio** — Confirmation, 24h, 2h, and cancellation SMS
- **Google Calendar** — OAuth, create/update/delete events
- **Open-Meteo** — Free weather API, auto-detects location
- **Supabase** — Auth, RLS policies, triggers, auto-profile creation

---

## Quick Start

### 1. Clone & Install

```bash
git clone https://github.com/DomainWarrior/proserv.git
cd proserv
npm install
```

### 2. Environment Variables

```bash
cp .env.local.example .env.local
```

| Variable | Where to Get |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Project Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Project Settings → API |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe Dashboard → API Keys |
| `STRIPE_SECRET_KEY` | Stripe Dashboard → API Keys |
| `STRIPE_WEBHOOK_SECRET` | Stripe Dashboard → Webhooks |
| `TWILIO_ACCOUNT_SID` | Twilio Console |
| `TWILIO_AUTH_TOKEN` | Twilio Console |
| `TWILIO_PHONE_NUMBER` | Twilio → Phone Numbers |
| `GOOGLE_CLIENT_ID` | Google Cloud Console → Credentials |
| `GOOGLE_CLIENT_SECRET` | Google Cloud Console → Credentials |
| `GOOGLE_REDIRECT_URI` | `http://localhost:3000/api/calendar/callback` |
| `RESEND_API_KEY` | resend.com → API Keys |

### 3. Set Up Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Go to SQL Editor → paste and run `supabase-schema.sql`
3. Enable Email Auth under Authentication → Providers

### 4. Stripe Webhooks (Local Dev)

```bash
stripe login
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

Copy the webhook signing secret → `STRIPE_WEBHOOK_SECRET`.

### 5. Run

```bash
npm run dev
# http://localhost:3000
```

---

## Project Structure

```
src/
├── app/
│   ├── (public)/          # Homepage, services, booking
│   ├── (auth)/            # Login, signup
│   ├── (dashboard)/       # Customer portal
│   ├── (admin)/           # Admin dashboard
│   └── api/               # API routes
│       ├── appointments/  # CRUD + status
│       ├── payments/      # Stripe PaymentIntents
│       ├── webhooks/      # Stripe webhook handler
│       ├── calendar/      # Google Calendar OAuth
│       ├── sms/           # Twilio reminder cron
│       └── admin/         # Analytics
├── components/
│   ├── layout/            # Navbar, Footer, Sidebar
│   ├── home/              # Hero, Services, Testimonials
│   ├── services/          # Pricing, FAQ, QuoteForm
│   ├── appointments/      # AppointmentCard
│   ├── admin/             # Charts, tables
│   └── ui/                # Shared UI components
├── lib/
│   ├── supabase/          # client, server, middleware
│   ├── stripe/            # Payment helpers
│   ├── twilio/            # SMS templates
│   ├── google/            # Calendar OAuth
│   └── weather/           # Open-Meteo
└── types/
    └── index.ts           # Full TypeScript types
```

---

## Deployment

```bash
vercel --prod
```

In Vercel dashboard, add all env vars from `.env.local`, update `GOOGLE_REDIRECT_URI` and your Stripe webhook endpoint to your production domain. The `vercel.json` cron job runs SMS reminders every 30 minutes automatically.

---

## First Admin User

After signing up through the app, promote your account in Supabase SQL Editor:

```sql
UPDATE profiles SET role = 'admin' WHERE id = 'your-user-uuid';
```

---

## Security

- All API routes validate `supabase.auth.getUser()` before processing
- Row Level Security (RLS) enforced at the database level
- Admin routes require `role = 'admin'` in the user profile
- Stripe webhooks verified with signature header
- No sensitive keys exposed to the client

---

<div align="center">
  <sub>Built by <a href="https://github.com/DomainWarrior">DomainWarrior</a></sub>
</div>