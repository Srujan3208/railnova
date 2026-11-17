# RAILNOVA demo pack

> Everything in this pack is for UI/testing only. Sample train names, numbers, times, fares and availability are not verified operational railway data. Do not use them to plan travel. Demo PNRs are not IRCTC PNRs.

## Demo train data
See [trains.json](./trains.json). It contains sample routes for MAQ–SBC, UD–SBC, MAQ–CSMT, SBC–MAS and SBC–NDLS.

## Demo sign-in
The account page uses Supabase Auth. A demo user has **not** been created by this repository change. Create one in Supabase Dashboard → Authentication → Users → Add user:
- Email: `demo@railnova.in`
- Temporary password: set a unique password in the dashboard, then share it only with intended testers.
- Enable email confirmation only if your test flow expects it.

Do not put passwords in source control, public docs, frontend code, or chat. Do not use a shared demo password for production.

## Razorpay test mode
Razorpay Checkout requires a matching test Key ID and Key Secret. The Key ID alone is insufficient. Store both in server-side Vercel environment variables:
- `RAZORPAY_KEY_ID`
- `RAZORPAY_KEY_SECRET`

Never use a `NEXT_PUBLIC_` prefix for the secret. Generate/copy the matching pair from Razorpay Dashboard → Test Mode → API Keys, then redeploy. Do not claim payment success unless server-side signature and payment verification succeeds.

## Demo booking and ticket
The app's demo booking flow may generate a local-only reference and printable ticket. This is not a railway reservation, confirmed seat, or valid PNR. Real booking, live availability, official PNR generation and train running status require an authorised railway provider integration.
