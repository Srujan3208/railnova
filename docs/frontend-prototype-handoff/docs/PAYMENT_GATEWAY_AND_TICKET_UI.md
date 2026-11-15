# Payment gateway and ticket UI handoff

## Frontend now designed
- Gateway selection: Razorpay and TSTPay.
- Payment methods: UPI, cards, net banking and supported wallets.
- Order summary and demo payable total.
- Hosted checkout handoff explanation; no card/UPI PIN/CVV collection in the frontend.
- Simulated success and failure states.
- Ticket confirmation and browser Print / Save as PDF action.
- Admin control-centre preview with demo metrics and management modules.

## Backend phase connection plan
1. Browser requests a payment session from the RailNova server.
2. Server validates the current booking quote and creates a gateway order using server-side Razorpay or TSTPay credentials.
3. Server returns only the safe checkout/session information needed by the browser.
4. Browser opens the provider-hosted checkout.
5. Server verifies the signed provider webhook/callback and reconciles the booking status.
6. Only after verified payment and authorised railway booking confirmation does the server issue a real ticket PDF.

Never put secret keys in JavaScript or frontend environment variables. Do not trust a browser redirect as proof of payment. Use idempotency keys, signed webhooks, server-side verification and reconciliation. Confirm the exact TSTPay API, merchant onboarding, webhook signature scheme and supported methods from its official provider documentation before implementation.

## Ticket PDF
The current frontend button uses the browser print dialog; choose “Save as PDF”. Production ticket PDF generation should be server-side after confirmed booking, use the authoritative booking reference/PNR/coach/berth data, and be served from an authenticated or signed download URL.

## Admin security
The admin page is a visual preview only. Production admin authentication, role-based authorisation, MFA, audit logs and all privileged operations must be enforced on the server.
