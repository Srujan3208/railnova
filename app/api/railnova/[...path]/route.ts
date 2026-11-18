import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const allowed = new Set(['health', 'ready', 'v1']);

async function proxy(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const base = process.env.RAILNOVA_API_URL?.trim();
  if (!base) {
    return NextResponse.json({ error: { code: 'BACKEND_URL_MISSING', message: 'RAILNOVA_API_URL is not configured for this Vercel environment.' } }, { status: 503 });
  }

  const { path } = await context.params;
  if (!path.length || !allowed.has(path[0])) {
    return NextResponse.json({ error: { code: 'NOT_FOUND', message: 'RAILNOVA API route not found.' } }, { status: 404 });
  }

  let target: URL;
  try {
    target = new URL(path.map(encodeURIComponent).join('/'), base.endsWith('/') ? base : base + '/');
  } catch {
    return NextResponse.json({ error: { code: 'BACKEND_URL_INVALID', message: 'RAILNOVA_API_URL is not a valid absolute URL.' } }, { status: 500 });
  }

  request.nextUrl.searchParams.forEach((value, key) => target.searchParams.set(key, value));

  try {
    const upstream = await fetch(target, {
      method: 'GET',
      headers: {\n        Accept: 'application/json',\n        ...(request.headers.get('authorization') ? { Authorization: request.headers.get('authorization')! } : {}),\n      },
      cache: 'no-store',
      signal: AbortSignal.timeout(20000),
    });
    const body = await upstream.text();
    const contentType = upstream.headers.get('content-type') || '';

    // A Railway/Next.js HTML 404 usually means the backend service is still
    // running the frontend image or the domain is attached to the wrong service.
    if (!contentType.toLowerCase().includes('application/json')) {
      return NextResponse.json({
        error: {
          code: 'BACKEND_NON_JSON_RESPONSE',
          message: `Backend returned HTTP ${upstream.status} with content type "${contentType || 'unknown'}". Check that Railway is running the FastAPI Dockerfile from the backend service.`,
          upstream_status: upstream.status,
        },
      }, { status: 502, headers: { 'Cache-Control': 'no-store' } });
    }

    return new NextResponse(body, {
      status: upstream.status,
      headers: { 'Content-Type': contentType, 'Cache-Control': 'no-store' },
    });
  } catch (error) {
    const timedOut = error instanceof Error && error.name === 'TimeoutError';
    return NextResponse.json({
      error: {
        code: timedOut ? 'BACKEND_TIMEOUT' : 'BACKEND_UNAVAILABLE',
        message: timedOut ? 'RAILNOVA backend request timed out.' : 'Could not reach the RAILNOVA backend. Check the Railway deployment and public domain.',
      },
    }, { status: timedOut ? 504 : 502 });
  }
}

export const GET = proxy;
