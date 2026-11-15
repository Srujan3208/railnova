# RAILNOVA — Next-generation rail travel workspace

A responsive Next.js application designed around Explore, Trips, Travel day, Services, Account and Help. It uses Supabase Auth when configured and ships with a PostgreSQL schema that enforces per-user access through Row Level Security.

## Important production boundary

This repository intentionally contains **no fabricated train schedules, fares, seat inventory, PNRs, bookings, payment outcomes or ticket references**. Railway search, availability, booking, PNR, running status, platform data and ticket issuance remain unavailable until an authorised railway inventory provider is contracted and configured. Payment processing remains unavailable until a merchant account and server-side payment integration are configured. The UI does not claim a successful payment or ticket issuance based on a browser event.

## Stack

- Next.js 15 / React 19 / TypeScript
- Supabase Auth + PostgreSQL with Row Level Security
- Vercel deployment
- Framer Motion for restrained transitions; reduced-motion support
- C++ booking-core source from the supplied backend archive is retained separately in `engine/` as a concurrency reference. It is not compiled into Vercel's Next.js runtime. A native C++ HTTP service should be deployed as a separate container service only if load testing justifies it.

## Local development

1. Install Node.js 20 or 22.
2. `npm install`
3. Copy `.env.example` to `.env.local` and fill in the Supabase project URL and anon/publishable key.
4. Apply `supabase/migrations/0001_initial_schema.sql` in the Supabase SQL Editor.
5. `npm run dev`.

## Supabase Auth setup

In Supabase Dashboard → Authentication → Providers, enable Email. For Google and Microsoft, configure the provider credentials and callback URLs there; the application exposes OAuth sign-in buttons but does not invent client secrets. Set the site's production URL and localhost redirect URLs in Authentication → URL Configuration.

Set these Vercel environment variables:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` (or the project's publishable key)

Never put a Supabase service-role key, payment secret, railway provider credential, or OAuth client secret in a `NEXT_PUBLIC_` variable.

## Vercel

Import/deploy this project with the Next.js framework preset. Build command: `next build`; install command: `npm install`. Add the environment variables above, then redeploy.

## Next integration stages

1. Contract an authorised railway data/booking provider; implement provider adapters server-side.
2. Implement station/journey search, quote, hold, booking, PNR and running-status endpoints with source timestamps.
3. Add payment checkout, signed webhook verification, reconciliation and refund processing.
4. Add email/SMS/push notification delivery and complaint workflows.
5. Load test booking idempotency and concurrency; add monitoring, audit review and operational runbooks.

## C++ core

`engine/` contains the supplied C++17 booking engine and concurrency tests. Build tests with `g++ -std=c++17 -O2 -pthread engine/test.cpp -o engine-tests && ./engine-tests`. The engine is not a substitute for PostgreSQL transactions or a trusted provider confirmation. Its in-memory state resets on process restart.
