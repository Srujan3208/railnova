# RAILNOVA UX review and release gates

**Review date:** 15 November 2026  
**Basis:** Existing RAILNOVA workflow research, Figma responsive screens, MagicPath prototype, current Next.js branch, Supabase schema and Vercel project configuration.

## 1. What is working well

- The booking journey is organised into train selection, passenger entry, review and payment.
- The route summary stays visible across the funnel, reducing context loss.
- Passenger forms include berth preferences and contact details.
- Fare estimates are separated into base fare, reservation/service fee and convenience fee.
- Mobile results use stacked train cards and large selection targets.
- The UI distinguishes demonstration data from live provider data.
- Existing Supabase sign-in and the RailRadar live-status function are retained.

## 2. Required UX improvements before a production release

| Priority | Area | Required change | Acceptance condition |
|---|---|---|---|
| P0 | Train search | Replace sample train cards with a server-side authorised provider adapter; do not show sample services as live results | Every result has source, freshness timestamp, class, quota and provider-backed availability |
| P0 | Booking | Implement quote/hold/confirm with server-side idempotency and expiry handling | Repeated submits cannot create duplicate reservations |
| P0 | Payment | Create gateway orders on the server, use hosted checkout, verify signed webhooks and reconcile pending/failed states | A browser redirect alone never marks a booking paid |
| P0 | Ticket | Render a real ticket only after provider booking confirmation and verified payment | Ticket reference/PNR comes from the provider, not the frontend |
| P0 | Cancellation | Calculate eligibility and refund from the provider and booking state machine | Passenger-level cancellation and refund status are auditable |
| P1 | Stations | Use searchable station autocomplete backed by canonical station codes | Ambiguous station names are disambiguated before search |
| P1 | Results | Add filters for departure, arrival, duration, class, quota and fare; provide clear empty/error/loading states | Filters remain usable on mobile and keyboard |
| P1 | Passenger entry | Validate name, age, gender, contact details and passenger count; clearly explain identity requirements | Errors are announced next to fields and preserve valid entries |
| P1 | Accessibility | Add visible keyboard focus, semantic headings, labelled controls, contrast checks and reduced-motion support | Keyboard-only flow can complete the demo funnel |
| P1 | Account | Connect My Trips, saved passengers and profile to authenticated Supabase rows with RLS | Users can only access their own records |
| P2 | Travel day | Add route stops, delay/source timestamp, chart status and notification preferences | Every status has a source and last-updated time |

## 3. Responsive review

- **Desktop (1440px):** use two-column layouts for booking content and fare summary; keep the main task visually dominant.
- **Tablet (834px):** collapse side panels and keep journey summary and primary actions full width.
- **Mobile (390px):** use stacked cards, a collapsible navigation menu, full-width primary actions and no horizontal page scrolling.
- Keep touch targets comfortably sized and avoid placing destructive cancellation actions beside the primary continue action.

## 4. Current implementation and integration findings

- The Supabase project is active and has the RAILNOVA tables, three applied migrations and RLS enabled on the listed public tables.
- The security advisor returned no findings at the time of review. The performance advisor reported unused indexes; these are informational and should be revisited after real query traffic exists.
- The stations, trains, train_stops, train_classes, booking and payment tables currently have zero rows. The frontend must not treat the empty catalogue as live inventory.
- The only deployed Edge Function found is railradar-live-status. There is no railway booking, reservation, payment-order, webhook or refund Edge Function in the project inventory.
- The Vercel project currently exposes only the Supabase URL and publishable key in its environment configuration. Razorpay and railway-provider server secrets are not configured there.
- The existing repository's Supabase migrations README documents migrations already applied to the live project, but the actual SQL migration files are not present in the repository. Restore a reproducible migration source before future schema changes.

## 5. Release decision

**Frontend prototype:** suitable for continued review and stakeholder feedback.  
**Production booking:** not ready. Railway inventory/booking provider, server-side booking orchestration, payment gateway credentials and webhook verification, ticket issuance, cancellation/refund workflows and browser-level responsive QA remain required.

Never represent the illustrative schedules, fares, availability or PNR values in the prototype as real railway information. RAILNOVA must remain clearly independent from IRCTC and Indian Railways branding.
