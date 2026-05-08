# ProServ — Production-Ready Local Service Business Website

A full-stack Next.js 14 application for local service businesses, featuring online booking, customer accounts, admin dashboard, Stripe payments, Google Calendar sync, and automated SMS reminders.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Styling | Tailwind CSS + custom design system |
| Auth & Database | Supabase (PostgreSQL + Row-Level Security) |
| Payments | Stripe (PaymentIntents + Webhooks) |
| SMS | Twilio |
| Calendar | Google Calendar API (OAuth 2.0) |
| Weather | Open-Meteo API (free, no key needed) |
| Email | Resend |
| Deployment | Vercel |

## Features

### Public Website
- ✅ Responsive hero with click-to-call button
- ✅ Service cards with pricing
- ✅ Before/after image gallery
- ✅ Animated testimonials carousel
- ✅ CTA sections throughout
- ✅ Full services page with pricing tiers
- ✅ Quote request form (saved to Supabase)
- ✅ FAQ accordion
- ✅ Dark mode
- ✅ Live chat widget

### Customer Portal
- ✅ Secure signup/login (Supabase Auth)
- ✅ Password strength indicator
- ✅ View upcoming & past appointments
- ✅ Reschedule appointments inline
- ✅ Cancel appointments
- ✅ Full calendar view (React Big Calendar)
- ✅ Real-time weather in calendar (Open-Meteo)
- ✅ Service history & invoices
- ✅ Notification center (mark as read)
- ✅ Profile & password management
- ✅ SMS/email notification preferences
- ✅ Google Calendar sync (OAuth)

### Admin Dashboard
- ✅ Analytics: revenue, jobs, ratings, customers
- ✅ Revenue bar charts (Recharts)
- ✅ Appointment approval system
- ✅ Worker assignment via dropdown
- ✅ Customer management table
- ✅ Worker management cards
- ✅ Business settings
- ✅ Integration manager (Stripe, Twilio, Google, Resend)

### Integrations
- ✅ **Stripe**: PaymentIntent, webhooks, auto-confirm on payment
- ✅ **Twilio**: Confirmation, 24h reminder, 2h reminder, cancellation SMS
- ✅ **Google Calendar**: OAuth, create/update/delete events
- ✅ **Open-Meteo**: Free weather API, auto-detects customer location
- ✅ **Supabase**: Auth, RLS, triggers, auto-profile creation

---

## Quick Start

### 1. Clone & Install

```bash
git clone <your-repo>
cd proserv
npm install
```

### 2. Set Up Environment Variables

```bash
cp .env.local.example .env.local
```

Fill in all values in `.env.local`. See the table below for where to get each.

| Variable | Where to Get |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase project settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase project settings → API |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe Dashboard → Developers → API Keys |
| `STRIPE_SECRET_KEY` | Stripe Dashboard → Developers → API Keys |
| `STRIPE_WEBHOOK_SECRET` | Stripe Dashboard → Webhooks (after adding endpoint) |
| `TWILIO_ACCOUNT_SID` | Twilio Console → Dashboard |
| `TWILIO_AUTH_TOKEN` | Twilio Console → Dashboard |
| `TWILIO_PHONE_NUMBER` | Twilio Console → Phone Numbers |
| `GOOGLE_CLIENT_ID` | Google Cloud Console → Credentials |
| `GOOGLE_CLIENT_SECRET` | Google Cloud Console → Credentials |
| `GOOGLE_REDIRECT_URI` | Set to `http://localhost:3000/api/calendar/callback` |
| `RESEND_API_KEY` | resend.com → API Keys |

### 3. Set Up Supabase Database

1. Create a project at [supabase.com](https://supabase.com)
2. Go to SQL Editor
3. Paste and run the full contents of `supabase-schema.sql`
4. Enable Email Auth under Authentication → Providers

### 4. Set Up Stripe Webhooks (Local Dev)

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login and forward webhooks locally
stripe login
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

Copy the webhook signing secret and set it as `STRIPE_WEBHOOK_SECRET`.

### 5. Set Up Google OAuth

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create a project → Enable Google Calendar API
3. Create OAuth 2.0 credentials (Web Application)
4. Add `http://localhost:3000/api/calendar/callback` as an authorized redirect URI
5. Copy Client ID and Secret to `.env.local`

### 6. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Project Structure

```
src/
├── app/
│   ├── (public)/          # Homepage, services, booking
│   ├── (auth)/            # Login, signup, reset password
│   ├── (dashboard)/       # Customer portal
│   ├── (admin)/           # Admin dashboard
│   └── api/               # All API routes
│       ├── auth/          # Auth actions + callback
│       ├── appointments/  # CRUD + status updates
│       ├── payments/      # Stripe PaymentIntents
│       ├── webhooks/      # Stripe webhook handler
│       ├── weather/       # Open-Meteo proxy
│       ├── calendar/      # Google Calendar OAuth
│       ├── sms/           # Twilio reminder cron
│       └── admin/         # Admin analytics
├── components/
│   ├── layout/            # Navbar, Footer, DashboardSidebar
│   ├── home/              # Hero, Services, Testimonials, etc.
│   ├── services/          # PricingCards, FAQ, QuoteForm
│   ├── appointments/      # AppointmentCard
│   ├── admin/             # Charts, tables, actions
│   ├── payments/          # Stripe payment form
│   └── ui/                # ChatWidget, MarkAllRead, etc.
├── lib/
│   ├── supabase/          # client.ts, server.ts, middleware.ts
│   ├── stripe/            # Payment intents, customers, refunds
│   ├── twilio/            # SMS templates
│   ├── google/            # Calendar OAuth + event management
│   └── weather/           # Open-Meteo API
└── types/
    └── index.ts           # Full TypeScript types
```

---

## Deployment to Vercel

```bash
npm install -g vercel
vercel --prod
```

In Vercel dashboard:
1. Add all environment variables from `.env.local`
2. Change `GOOGLE_REDIRECT_URI` to your production URL
3. Update Stripe webhook endpoint to `https://yourdomain.com/api/webhooks/stripe`
4. The `vercel.json` cron job will automatically run SMS reminders every 30 minutes

---

## Creating Your First Admin User

After signing up normally:

```sql
-- Run in Supabase SQL editor
UPDATE profiles SET role = 'admin' WHERE id = 'your-user-uuid';

-- To add a worker
UPDATE profiles SET role = 'worker' WHERE id = 'worker-user-uuid';
INSERT INTO workers (id, specialties, bio, is_available)
VALUES ('worker-user-uuid', '{lawn_care,snow_removal}', 'Experienced outdoor specialist.', true);
```

---

## Generating Supabase Types

```bash
npx supabase gen types typescript \
  --project-id YOUR_PROJECT_ID \
  > src/types/supabase.ts
```

---

## Security Notes

- All API routes check `supabase.auth.getUser()` before processing
- Row Level Security (RLS) enforced at DB level — customers can only see their own data
- Admin routes require `role = 'admin'` in profile
- Stripe webhook signature verified with `STRIPE_WEBHOOK_SECRET`
- Cron endpoint protected by `CRON_SECRET` header
- Passwords handled entirely by Supabase Auth (bcrypt)
- No sensitive keys exposed to the client
