# MASTER PROMPT — RAILNOVA Railway Booking Website

> Paste this entire prompt into your chosen AI website builder or coding agent. It defines the complete product vision, screens, interactions, visual rules, assets, and staged delivery contract. The present task is **Stage 1: frontend only**. Do not connect the database or backend until the frontend has been reviewed and approved.

## ROLE

Act as a senior product designer, UX researcher, visual designer, accessibility specialist and senior frontend engineer working collaboratively with the product owner. Build a high-quality, production-minded railway journey planning and booking website called **RAILNOVA**.

Study the familiar Indian railway reservation journey: journey search, train list, class-level availability, fare inspection, passenger and berth information, booking review, payment selection, confirmation, PNR enquiry and post-booking management. The interaction model should feel familiar to passengers already accustomed to Indian Railways booking systems, with the same level of functional depth and journey coverage expected from a serious rail booking product.

**Do not copy IRCTC's logo, wordmark, proprietary illustrations, exact page artwork, exact pixel layout or claim to be the official IRCTC website.** RAILNOVA is an independent product identity. Use familiar reservation conventions and feature parity, but create a distinct, cleaner design system and original visual assets.

## DELIVERY RULE — WORK IN STAGES

### Stage 1 — FRONTEND ONLY (do this now)

1. Inspect the project folder and read the supplied research, scope, assets and design tokens.
2. Build the entire responsive frontend using the agreed design system.
3. Implement every page and clickable flow listed below.
4. Use clearly labelled demo data and local-only storage where persistence is needed.
5. Provide complete frontend files, start instructions and a manual acceptance-test checklist.
6. Do not create Supabase tables, backend APIs, authentication, railway API calls or live payment integration in this stage.
7. Stop after the frontend has been built and tested. Present the user with a review checklist and wait for explicit approval before beginning Stage 2.

### Stage 2 — DATABASE AND BACKEND (only after explicit approval)

Design and implement PostgreSQL/Supabase, authentication, row-level security, API/service modules, railway provider adapters, payment gateway integration, webhook verification, booking reconciliation, cancellation/refund workflows and notifications according to `docs/DATABASE_BACKEND_PHASE_2.md`. Do not start Stage 2 automatically.

### Stage 3 — INTEGRATIONS, TESTING AND DEPLOYMENT

Only after Stage 2 approval, connect authorised railway data/booking services, sandbox payment provider, email/SMS/push notifications, analytics, monitoring, security tests and deployment pipeline.

## PRODUCT VISION

Create one coherent digital railway journey workspace where a passenger can:

- Discover journey options between stations.
- Compare trains, timings, duration, stops, classes, availability and fare.
- Review route details before booking.
- Enter details for multiple passengers and choose berth preferences.
- Review the total and applicable charges transparently.
- Choose a payment method and understand each payment state.
- Access a clear electronic ticket / booking summary.
- Check PNR status and journey running information.
- Manage upcoming, completed and cancelled trips.
- Find cancellation, refund and TDR information.
- Access train schedule, reservation chart/vacancy information, station help and travel services.

The interface must reduce uncertainty, preserve context between steps, clearly explain next actions and prevent accidental duplicate submissions.

## VISUAL DIRECTION

Create a premium, modern Indian railway booking experience that feels trustworthy, information-rich and highly usable — not a generic travel landing page.

- Brand: RAILNOVA.
- Tagline: YOUR JOURNEY, WELL PLANNED.
- Primary colour: deep midnight navy (#102B46).
- Secondary navy: #183E61.
- Action accent: warm railway orange (#EF7F3B).
- Main canvas: cool near-white (#F6F8FA) with white content panels.
- Positive state: green (#16845B); caution: amber; errors: muted red.
- Typography: Manrope for headings, DM Sans for interface/body text (or similarly clear available fonts).
- Use clear spacing, strong alignment, neat cards, subtle borders, restrained shadows, readable tables and obvious focus states.
- Use a persistent desktop header with a compact utility row; use a responsive mobile menu and a mobile-first task layout.
- Booking forms should be prominent and easy to scan, with origin/destination swap, date, class and quota visible together.
- Result cards should expose the important decision data without requiring the user to open each result.
- Use a sticky booking summary on larger screens and an appropriately accessible mobile summary pattern.
- Do not overuse gradients, glassmorphism, floating blobs, huge empty hero sections or decorative animations.
- Use motion only for small state transitions and respect reduced-motion preferences.

## IMAGE PLAN — USE THESE SIX ORIGINAL ASSETS

The project includes six generated image files under `frontend/assets/`:

1. `hero-mountain-train.jpg` — wide hero banner showing an Indian passenger train through green mountains.
2. `modern-station.jpg` — modern station concourse / station information feature.
3. `train-coach-interior.jpg` — coach interior / class and onboard experience card.
4. `coastal-rail-journey.jpg` — coastal rail route / discovery card.
5. `station-platform.jpg` — passenger platform / travel-day support card.
6. `onboard-meal.jpg` — onboard meal / food service card.

Use these six image assets intentionally. The website's actual interface is primarily built from HTML/CSS components, not screenshots. Do not generate fake screenshots of the website and insert them as page backgrounds. Do not place UI labels, brand logos or words inside the photography. Create brand marks and interface icons as editable SVG/CSS or use a consistent icon library. Payment logos must only be included if supplied/approved by the payment provider; otherwise use neutral method labels/icons.

## REQUIRED INFORMATION ARCHITECTURE AND PAGES

### 1. Public landing / Book Ticket

- Global header, RAILNOVA brand, navigation, sign-in action, language selector.
- Hero with primary journey search module.
- Origin station and destination station with autocomplete.
- Swap stations control.
- Journey date picker and flexible-date option.
- Travel class selector: All Classes, AC 1 Tier, AC 2 Tier, AC 3 Tier, Sleeper, AC Chair Car, Second Sitting.
- Quota selector: General, Tatkal, Premium Tatkal, Ladies, Senior Citizen, Divyangjan; show eligibility/help text where appropriate in a real implementation.
- Search trains CTA.
- Quick service shortcuts: PNR, live train status, train schedule, chart/vacancy, my trips, support.
- Travel discovery/content area using generated images.
- Footer with support, legal, accessibility and independent-product disclaimer.

### 2. Station search / suggestions

- Search by station name or code.
- Recent and popular stations.
- Keyboard navigation, clear selection, no-results state.
- Avoid inventing official autocomplete data; use a small, clearly identified sample list until a verified station dataset is connected.

### 3. Train search results

- Route header: origin, destination, journey date and edit action.
- Results list with train name, train number/identifier, departure, arrival, duration, intermediate stops, operating-day context, class and availability.
- Each result displays class-level fare and availability status.
- Filters: available only, departure time, arrival time, train type, travel duration, class, fare band.
- Sort: recommended, earliest departure, fastest journey, lowest fare.
- Route/timetable expansion and fare details.
- Loading, no-results, stale-data and provider-unavailable states.
- Show availability's timestamp and source in a real integration.

### 4. Train details and route timeline

- Complete station stop sequence.
- Scheduled arrival/departure, day offset and halt duration.
- Journey duration, distance where verified, route notes and boarding point.
- Selected class, fare components, availability freshness and relevant restrictions.

### 5. Class / berth availability

- Single view of class options where provider data supports it.
- Status labels such as Available, RAC, Waitlist, Not Available and Current Reservation where appropriate.
- Explain that availability can change before booking confirmation.
- Berth/seat layout only if the provider exposes reliable seat-selection data. Do not invent coach-level seat maps for a live booking.

### 6. Passenger details

- Multiple passenger forms.
- Name, age/date fields as required by booking rules, gender where legally/operationally required, berth preference and applicable preference/concession fields.
- Add/remove passenger and saved traveller profile selection.
- Contact details and notification consent.
- Field validation, plain-language error messages, privacy note and safe session handling.
- Preserve safe progress on recoverable errors.

### 7. Review booking

- Journey summary, date, class, passengers, boarding point and contact details.
- Itemised fare: base fare, reservation/superfast/service charges, taxes and optional add-ons only when returned by the authoritative quote service.
- Total payable amount.
- Cancellation and change terms, consent checkbox and edit links.
- Revalidate inventory and fare before creating a payment session.

### 8. Payment and payment outcomes

Provide a dedicated, complete payment workspace:

- UPI app intent / UPI QR flow where supported.
- Debit and credit cards (Visa, Mastercard, RuPay and other approved networks as configured by provider).
- Net banking / bank selection.
- Supported wallets / eWallet.
- EMI or pay-later only if enabled for the merchant and transaction.
- Clear order summary and final amount.
- Secure provider handoff; no raw card/CVV/UPI PIN/OTP is stored in the app.
- States: ready, processing, awaiting provider, success, failed, cancelled, expired, duplicate-prevented, refund initiated, refunded and refund exception.
- Do not show a success ticket until the backend has verified payment and booking outcome.
- Failed/pending transactions must be checked/reconciled before retry, to avoid duplicate charge.
- In Stage 1, simulate these states without collecting any real payment credentials or sending transactions.

### 9. Booking confirmation / electronic ticket view

- Prominent status and sample booking reference.
- PNR only if returned by real provider; demo PNR must be clearly labelled.
- Passenger list, journey details, boarding point, class, coach/berth if allotted, fare and payment reference.
- Print/download/share actions with accessible output.
- Ticket QR only when issued by the real provider; never create a decorative QR and imply it is valid for travel.

### 10. My Trips / booking management

- Tabs: Upcoming, Past, Cancelled, Failed transactions.
- Search/filter by reference, date and status.
- Booking detail page and ticket download/print.
- Passenger-level partial cancellation where supported.
- Boarding point change where supported by provider rules.
- TDR filing and status history where supported.
- Refund status, amount, payment method, provider reference and timestamps.
- Stage 1 actions must only alter sample/demo browser data.

### 11. PNR enquiry

- 10-digit input with validation.
- Sample response with booking status, passenger chart status and journey details.
- Clear last-updated time/source.
- Real PNR lookup must later use an approved authoritative service.

### 12. Live train status

- Search by train name or number and journey date.
- Last reported station, last update time, current running state, delay, next stop and route timeline.
- Stale/unavailable data state.
- Stage 1 must label the timeline as simulated.

### 13. Train schedule

- Train identity, days of operation, source/destination and full timetable.
- Arrival/departure, halt duration, day offset and route order.
- Search and print/download timetable view.

### 14. Chart and vacancy

- Train/date/class selector.
- Reservation chart state and vacancy summary if authoritative data is available.
- Do not claim live berth availability from demo rows.

### 15. Account / saved travellers

- Profile, contact preferences, language, notification preferences and security settings.
- Saved passenger list and editable preferences.
- Sign-in, account recovery and MFA/biometric patterns (visual design only until identity backend is approved).
- Never implement insecure password storage or fake production authentication.

### 16. Travel services

- Food ordering on train, station information, onboard services, passenger assistance, accessibility, tourism/route discovery and partner services.
- Make partner integration and availability explicit.

### 17. Help / support

- FAQ, booking support, cancellation/refund guide, accessibility help, issue reporting and support ticket reference.
- Contextual help near complex booking/payment fields.

## DESIGN SYSTEM AND IMPLEMENTATION REQUIREMENTS

- Desktop content max-width approximately 1200–1280 px.
- Responsive breakpoints around 360, 768, 1024 and 1440 px.
- 12-column desktop grid, 8-column tablet, 4-column mobile.
- Use a consistent spacing scale: 4, 8, 12, 16, 24, 32, 48, 64 px.
- Standard card radius 14–18 px; use one consistent border and shadow system.
- Minimum touch target 44×44 px.
- Use semantic HTML, real labels, keyboard navigation, visible focus indicators and screen-reader announcements for dynamic status.
- Aim for WCAG 2.2 AA.
- Avoid colour-only communication of status; add text and icon labels.
- Respect reduced motion and browser zoom.
- Provide empty, loading, success, warning, error and offline states.
- Use reusable components for buttons, inputs, station autocomplete, date field, train card, class availability chip, passenger card, booking summary, payment method, status banner, notification row, ticket and empty state.
- Keep data and presentation separated. The UI should consume a demo-data adapter that can later be replaced by an API client.

## DEMO DATA RULES FOR STAGE 1

- Use clearly fictional RailNova sample train identifiers (e.g. RN-101), fares, availability, PNR-like values and booking references.
- Label every simulated result, payment and ticket.
- Never represent the sample PNR, QR, fare, inventory, status or ticket as real railway data.
- Never request real card numbers, CVV, UPI PIN, OTP or bank credentials.
- Do not claim that clicking a demo payment button has moved money or booked a real ticket.
- Local browser storage may be used only for demo trips and sample passenger profiles; add a clear explanation that data is local to the device/browser.

## FUTURE DATABASE/BACKEND PLAN — DOCUMENT ONLY IN STAGE 1

Plan for PostgreSQL/Supabase entities: profiles, traveller_profiles, stations, trains, train_stops, journey_searches, availability_quotes, bookings, booking_passengers, payment_attempts, payment_events, refunds, cancellation_requests, tdr_cases, trip_events, notifications, support_tickets and audit_events.

Design relationships and API boundaries in the handoff notes. Use Row Level Security for user-owned records. Store money as integer minor units, use idempotency keys, verify payment webhooks server-side, keep railway provider secrets off the browser, and never store CVV/UPI PIN/OTP/raw card credentials.

Real railway reservation and payment operations require authorised agreements/provider access. If no authorised booking API is available, do not scrape or reverse-engineer restricted endpoints; ship only journey planning and permitted information features with clear outbound booking paths.

## REQUIRED OUTPUTS

1. Complete frontend source code.
2. Responsive page and component structure.
3. Six original image assets in the correct sections.
4. A central design token file.
5. A working demo booking path from search to confirmation.
6. PNR, live status, schedule, chart, trip management, account and services screens.
7. No backend/database integration yet.
8. Setup/readme instructions.
9. Manual test checklist.
10. A short handoff report explaining what is working, what is simulated and what needs Stage 2.

## FINAL QUALITY BAR

The result should feel like a carefully designed national railway booking product: precise information hierarchy, dense but calm booking data, no visual clutter, strong typography, polished status colours, predictable forms, well-designed empty/error states, mobile usability and a complete ticketing journey. Prioritise the usefulness and reliability of the booking experience over decorative effects.

**Start with Stage 1 frontend only. Build, test and present it for review. Do not begin the database or backend until the product owner explicitly approves the frontend.**
