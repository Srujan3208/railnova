export type RailnovaApiError = { error?: { code?: string; message?: string }; detail?: string };
export async function railnovaGet<T = unknown>(path: string): Promise<T> {
  const response = await fetch('/api/railnova/' + path.replace(/^\/+/, ''), { method: 'GET', headers: { Accept: 'application/json' }, cache: 'no-store' });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = payload?.error?.message || payload?.detail || `RAILNOVA API request failed (${response.status}).`;
    throw new Error(message);
  }
  return payload as T;
}
