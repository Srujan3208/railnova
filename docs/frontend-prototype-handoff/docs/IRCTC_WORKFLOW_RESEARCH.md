# Railway Booking Reference Research

**Research snapshot:** 15 November 2026  
**Scope:** Public booking workflow and feature coverage for a new independent railway platform frontend.

## Research summary
The official IRCTC e-ticket guide describes the passenger journey as: register/sign in, plan travel, choose a train, inspect route/timings and class fare, check availability, enter passenger details and berth preferences, choose a payment option, complete payment, and access the electronic reservation slip. The cancellation guide describes booked-ticket history and passenger-level cancellation, including partial cancellation. The official FAQ covers e-ticket cancellation and refund handling.

The current IRCTC Rail Connect app listing also describes secure login, biometric/PIN access, class availability in one view, train search and route details, PNR enquiry, multiple booking quotas, current reservation, saved passenger management, IRCTC eWallet, UPI, net banking, cards, EMI and supported wallets, boarding-point changes, booking/cancellation/TDR, Aadhaar linking, reservation chart availability, accessibility support and alerts.

RailOne is a distinct, broader Indian Railways app direction: a Ministry of Railways press release dated 12 August 2026 states it brings reserved and unreserved ticketing, platform tickets, train enquiry, PNR enquiry, RailMadad and other public-facing services together.

## Design implications
1. Build the booking funnel as a coherent sequence, with route summary and fare visibility at every step.
2. Support train search, class-level availability, route/timetable inspection and quota selection.
3. Support multiple passengers and berth preferences in a structured traveller form.
4. Make the payment method choice and payment outcome explicit; pending and failed transactions need their own states.
5. Put tickets, booking history, cancellations, TDR and refund history in a trip-management workspace.
6. Include PNR, running status, schedule and chart/vacancy as first-class service pages.
7. Provide accessible form labels, keyboard operation, high contrast, responsive layout and assistive-technology support.
8. Clearly separate sample/demo content from live railway/provider-confirmed information.

## Official sources consulted
- IRCTC official e-ticket booking guide: https://contents.irctc.co.in/en/bookEticket.html
- IRCTC official e-ticket FAQ: https://contents.irctc.co.in/en/etktfaq.html
- IRCTC official Rail Connect app listing: https://contents.irctc.co.in/en/IRCTC_andriod_App.html
- IRCTC Rail Connect user guide (PDF): https://contents.irctc.co.in/en/UserGuideIRCTC.pdf
- IRCTC e-ticket cancellation guide (PDF): https://contents.irctc.co.in/en/User%20Guide%20E-Ticket%20Cancellation.pdf
- Ministry of Railways / PIB press release about RailOne, 12 August 2026: https://indianrailways.gov.in/public/cms/downloadCmsDoc?filePath=%2Fopt%2Fmount%2FIndianRailways%2FuploadedFile%2F178669305520012AUG2026-3.pdf

## Scope and accuracy notes
This research is a workflow and feature reference, not permission to impersonate IRCTC, use its logos, copy proprietary assets, scrape restricted systems or claim access to live reservation inventory. RAILNOVA is an independent product concept. The frontend currently uses only illustrative train names, identifiers, dates, availability, fares, PNR-like references and transaction outcomes. Real data must be provided through authorised integrations and agreements.
