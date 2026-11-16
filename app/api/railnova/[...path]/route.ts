import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const allowed = new Set(['health','ready','v1']);

async function proxy(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const base = process.env.RAILNOVA_API_URL?.trim();
  if (!base) return NextResponse.json({ error: { code: 'BACKEND_URL_MISSING', message: 'RAILNOVA backend URL is not configured on this deployment.' } }, { status: 503 });
  const { path } = await context.params;
  if (!path.length || !allowed.has(path[0])) return NextResponse.json({ error: { code: 'NOT_FOUND', message: 'API route not found.' } }, { status: 404 });
  const target = new URL(path.map(encodeURIComponent).join('/'), base.endsWith('/') ? base : base + '/');
  request.nextUrl.searchParams.forEach((value, key) => target.searchParams.set(key, value));
  try {
    const upstream = await fetch(target, { method: 'GET', headers: { Accept: 'application/json' }, cache: 'no-store', signal: AbortSignal.timeout(15000) });
    const body = await upstream.text();
    return new NextResponse(body, { status: upstream.status, headers: { 'Content-Type': upstream.headers.get('content-type') || 'application/json', 'Cache-Control': 'no-store' } });
  } catch {
    return NextResponse.json({ error: { code: 'BACKEND_UNAVAILABLE', message: 'Could not reach the RAILNOVA backend. Check its deployment and URL.' } }, { status: 502 });
  }
}
export const GET = proxy;
