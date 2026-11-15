# Phase 2 — Database and Backend Connection Plan

**Do not start this phase until the frontend flow and screen acceptance checklist are reviewed.**

## Recommended platform
- PostgreSQL database (Supabase PostgreSQL is a suitable managed option)
- Supabase Auth or another established identity provider for user authentication
- Server-side API / edge functions for all privileged booking and payment operations
- Storage only for non-sensitive assets and approved documents
- Queue/background worker for payment reconciliation, notification delivery and webhook retries

## Core database entities
| Table | Purpose | Important fields |
|---|---|---|
| profiles | Authenticated user profile | id (auth user UUID), display_name, email, phone, locale, created_at |
| traveller_profiles | Saved passenger profiles | id, user_id, name, age/date fields as permitted, gender, berth_preference |
| stations | Station reference data | code, name, city, state, aliases, active |
| trains | Train master / provider mapping | id, provider_key, number, name, active |
| train_stops | Ordered route stop data | train_id, station_code, stop_order, arrival, departure, day_offset |
| journey_searches | Search audit/cache metadata | user_id nullable, origin_code, destination_code, journey_date, searched_at |
| availability_quotes | Provider-returned class availability and quote | provider_quote_id, train_id, class_code, availability, fare_minor, currency, expires_at |
| bookings | Booking orchestration record | id, user_id, provider_booking_id, booking_reference, pnr, status, amount_minor, currency |
| booking_passengers | Passenger records for a booking | booking_id, traveller_profile_id nullable, name snapshot, age snapshot, berth preference |
| payment_attempts | Payment attempts | id, booking_id, provider, provider_order_id, provider_payment_id, amount_minor, status, idempotency_key |
| payment_events | Verified webhook/event log | id, payment_attempt_id, provider_event_id, event_type, signature_verified, received_at |
| refunds | Refund tracking | id, booking_id, payment_attempt_id, provider_refund_id, amount_minor, status, timestamps |
| cancellation_requests | Cancellation workflow | id, booking_id, requested_by, passenger_ids, status, provider_reference |
| tdr_cases | TDR filing and status | id, booking_id, reason_code, provider_reference, status, updated_at |
| trip_events | Journey/status timeline | id, booking_id, event_type, message, source, source_timestamp |
| notifications | User notification inbox | id, user_id, channel, template_key, status, sent_at, read_at |
| support_tickets | Support case management | id, user_id, booking_id nullable, category, status, created_at |
| audit_events | Security and operational audit trail | id, actor_id, action, entity_type, entity_id, trace_id, created_at |

## Relationship outline
- profiles 1—many traveller_profiles
- profiles 1—many bookings
- bookings 1—many booking_passengers
- bookings 1—many payment_attempts
- payment_attempts 1—many payment_events
- bookings 1—many refunds / cancellation_requests / tdr_cases / trip_events
- profiles 1—many notifications / support_tickets
- trains 1—many train_stops

## API boundary
The browser should call application endpoints; it must never call a privileged railway provider or payment API directly with secret credentials.

Suggested endpoints:
- GET /api/stations?query= — station search
- POST /api/journeys/search — authorised journey search
- GET /api/journeys/:journeyId — journey details and quote metadata
- POST /api/availability/quote — revalidate availability and fare
- POST /api/bookings — create booking intent with idempotency key
- POST /api/payments/session — create a payment provider session
- POST /api/webhooks/payment/:provider — verify payment webhook signature server-side
- GET /api/bookings/:id — fetch booking state
- POST /api/bookings/:id/cancel — request eligible cancellation
- POST /api/bookings/:id/tdr — submit eligible TDR request
- GET /api/bookings/:id/events — trip status / timeline events
- GET /api/users/me/travellers — saved traveller profiles

## Security and correctness rules
1. Enable Row Level Security on user-owned tables. A user can access only their own profile, travellers, bookings, notifications and support cases.
2. Public station/train reference data may be read-only; never expose provider keys or secrets to the browser.
3. Store money as integer minor units (paise), with an explicit currency. Do not use floating-point arithmetic for settlement amounts.
4. Use idempotency keys for booking and payment session creation.
5. Verify payment webhooks using provider signatures; browser redirects are not proof of payment.
6. Reconcile payment status and railway booking status separately before presenting a final ticket.
7. Never store CVV, UPI PIN, passwords, OTPs or raw card data.
8. Keep provider payloads in a restricted, encrypted audit store only where legally and operationally required; avoid storing excess personal information.
9. Record explicit timestamps, provider source, freshness and status provenance for live operational data.
10. Use sandbox/test credentials until end-to-end security and provider approval is complete.

## Integration dependency
A production railway ticket booking system requires an authorised reservation/data partner route, a supported provider agreement and documented API access. Do not scrape or reverse-engineer restricted railway endpoints. If no authorised booking integration is available, launch only as a journey-planning / information product and clearly identify outbound booking links.

## Phase 2 completion checklist
- Approve schema and data retention policy
- Create dev/staging/prod environments
- Implement auth and RLS policies
- Implement server-side station and journey adapters
- Implement booking orchestration and idempotency
- Implement payment provider sandbox and webhook verification
- Implement reconciliation jobs
- Implement notification service
- Add integration tests, audit logging and monitoring
- Replace frontend demo adapters with typed API clients
