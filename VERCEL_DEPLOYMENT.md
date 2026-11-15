# RAILNOVA — deploy without GitHub

## Already configured
- Vercel project: `railnova`
- Framework: Next.js
- Node.js: 22.x
- Function region: Mumbai (`bom1`)
- Environment variables set for Production, Preview and Development:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY` (modern Supabase publishable key)
- Git integration is not required.

## Deploy from this folder
Use a computer with Node.js 20/22 and internet access.

```bash
npm install
npm run build
npm install --global vercel
vercel login
vercel link
# Select the existing project named railnova
vercel deploy --prod
```

The Vercel project already contains the Supabase environment variables. If the CLI asks to pull them locally, use:

```bash
vercel env pull .env.local
```

Then deploy again with `vercel deploy --prod`.

## Supabase Auth provider setup
In Supabase Dashboard → Authentication → Providers:
1. Enable Email.
2. For Google and Azure (Microsoft), add the OAuth client ID and secret from the corresponding identity-provider consoles.
3. Add the final Vercel production URL to Supabase Authentication → URL Configuration as the Site URL and an allowed redirect URL. Add localhost for development.

## Production integrations still required
- Authorised railway provider for actual train inventory, fares, PNR, running status, booking confirmation and ticket issuance.
- Payment merchant account and server-side webhook verification.
- Email/SMS/push delivery credentials.

Never add service-role, payment-secret, OAuth-client-secret or railway-provider keys to a `NEXT_PUBLIC_` variable. Do not advertise demo search results as live data.
