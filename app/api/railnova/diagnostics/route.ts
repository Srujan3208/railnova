import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type Probe = {
  ok: boolean;
  status: number | null;
  detail: string;
};

async function probe(name: string, url: string): Promise<Probe> {
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      cache: 'no-store',
      signal: AbortSignal.timeout(8000),
    });
    const raw = await response.text();
    let payload: any = null;
    try { payload = raw ? JSON.parse(raw) : null; } catch { /* preserve safe status only */ }

    if (!response.ok) {
      return {
        ok: false,
        status: response.status,
        detail: payload?.error?.message || payload?.detail || `${name} returned HTTP ${response.status}.`,
      };
    }

    if (name === 'railway-provider' && payload?.railway_provider_configured === false) {
      return { ok: false, status: response.status, detail: 'Railway provider credentials or endpoint mappings are not configured.' };
    }

    return { ok: true, status: response.status, detail: 'Connected.' };
  } catch (error) {
    const timedOut = error instanceof Error && error.name === 'TimeoutError';
    return {
      ok: false,
      status: null,
      detail: timedOut ? `${name} probe timed out.` : `${name} is unreachable.`,
    };
  }
}

export async function GET() {
  const base = process.env.RAILNOVA_API_URL?.trim();
  if (!base) {
    return NextResponse.json({
      status: 'degraded',
      checks: {
        api: { ok: false, status: null, detail: 'RAILNOVA_API_URL is not configured.' },
        railwayProvider: { ok: false, status: null, detail: 'Backend URL is missing; provider readiness cannot be checked.' },
      },
      integrations: {
        supabase: 'configured-by-environment',
        railwayProvider: 'not-verified',
        paymentGateway: 'not-configured-or-not-verified',
      },
    }, { status: 503, headers: { 'Cache-Control': 'no-store' } });
  }

  let root: URL;
  try {
    root = new URL(base.endsWith('/') ? base : base + '/');
  } catch {
    return NextResponse.json({
      status: 'degraded',
      checks: {
        api: { ok: false, status: null, detail: 'RAILNOVA_API_URL is invalid.' },
        railwayProvider: { ok: false, status: null, detail: 'Backend readiness cannot be checked.' },
      },
      integrations: {
        supabase: 'configured-by-environment',
        railwayProvider: 'not-verified',
        paymentGateway: 'not-configured-or-not-verified',
      },
    }, { status: 503, headers: { 'Cache-Control': 'no-store' } });
  }

  const [health, readiness] = await Promise.all([
    probe('backend-health', new URL('health', root).toString()),
    probe('railway-provider', new URL('ready', root).toString()),
  ]);

  const allReady = health.ok && readiness.ok;
  return NextResponse.json({
    status: allReady ? 'ready' : 'degraded',
    checks: { api: health, railwayProvider: readiness },
    integrations: {
      supabase: 'configured-by-environment',
      railwayProvider: readiness.ok ? 'configured' : 'not-ready',
      paymentGateway: 'not-configured-or-not-verified',
    },
    safety: {
      realBookingsEnabled: false,
      realPaymentsEnabled: false,
      reason: 'Railway booking and payment integrations require verified provider credentials, endpoint contracts, merchant checkout, and signed webhook reconciliation.',
    },
  }, {
    status: allReady ? 200 : 503,
    headers: { 'Cache-Control': 'no-store' },
  });
}
