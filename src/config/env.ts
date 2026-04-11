/** Public site / API origin (no trailing slash). Empty in dev → same origin + Vite `/api` proxy. */
export function getPublicWebBaseUrl(): string {
  const raw = (import.meta.env.VITE_PUBLIC_WEB_BASE_URL as string | undefined)?.trim()
  if (raw) return raw.replace(/\/$/, '')
  if (typeof window !== 'undefined') return window.location.origin.replace(/\/$/, '')
  return ''
}

/** Backend REST prefix: `{PUBLIC_WEB_BASE_URL}/api/v1` (or `/api/v1` behind dev proxy). */
export function getApiBaseUrl(): string {
  const base = getPublicWebBaseUrl()
  if (base) return `${base}/api/v1`
  return '/api/v1'
}

export function getAparuHttpRetries(): number {
  const raw = import.meta.env.VITE_APARU_HTTP_RETRIES as string | undefined
  const n = raw != null ? Number(raw) : 3
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : 3
}
