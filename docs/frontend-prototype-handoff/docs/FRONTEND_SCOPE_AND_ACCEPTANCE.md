# Frontend Scope and Acceptance Checklist

## Stage 1 deliverable
A responsive, interactive, browser-based frontend prototype. No backend, railway API, live inventory, real identity provider or live payment processing is enabled in this stage.

## Screens implemented
- Landing page with journey search
- Search results with demo train cards, class options, sorting and availability filter
- Passenger details with add/remove passenger and berth preferences
- Booking review and estimated fare summary
- Payment method selection (UPI, card, net banking, wallet) with an explicit demo-only payment action
- Demo booking success and printable sample ticket
- PNR enquiry with simulated response
- Live train status with simulated status timeline
- Train schedule and stop list
- Chart/vacancy information page with illustrative availability
- My Trips with local browser demo history and demo cancellation action
- Travel services cards (meals, station, onboard, passenger assistance, route discovery)
- Account page with locally saved demo traveller details
- Help and FAQ
- Sign-in modal with demo-only behaviour

## Interaction requirements
- Navigation works on desktop and mobile.
- Search form validates origin, destination and date.
- Origin/destination swap control works.
- Train class can be selected before moving to passenger entry.
- Passenger cards can be added and removed; required fields are validated.
- Passenger data is retained in the browser's local storage for demo purposes only.
- Review screen shows the selected journey, passenger count and estimated fare.
- Payment methods can be selected; the CTA simulates a success only and does not contact a gateway.
- Successful demo bookings appear in My Trips.
- Demo cancellation updates only local sample history.
- PNR and live train status pages display explicit simulated responses.
- Print action opens the browser print dialog for the demo ticket.

## Acceptance / manual test script
1. Open the landing page at desktop width and confirm the search panel and quick services are visible.
2. Swap the origin and destination fields.
3. Submit a search and inspect results.
4. Choose a class card and continue to passenger details.
5. Add a second passenger, fill both forms, and continue.
6. Confirm review summary and estimate are correct.
7. Select a payment method and use the demo payment action.
8. Confirm the sample ticket and booking reference appear.
9. Open My Trips and confirm the new sample booking is present.
10. Use the demo cancellation action and confirm the status changes locally.
11. Test PNR enquiry with a 10-digit sample value.
12. Test live status and train schedule pages.
13. Test the mobile nav and layouts at 390px and 768px widths.
14. Confirm demo warnings are visible and no live transaction is implied.

## Out of scope for Stage 1
- Production login, OTP, Aadhaar or biometric authentication
- Live train search, schedules, fares, seats, PNR or running-status data
- Real ticket booking or railway reservation system connection
- Payment gateway checkout, card handling, UPI collect/intent or refunds
- Real cancellation, TDR, chart vacancy or boarding-point changes
- Admin console and operational workflows

These are Stage 2+ work and require verified technical access, security design and operational approvals.
