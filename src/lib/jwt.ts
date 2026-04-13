export type JwtRole = 'user' | 'driver' | 'admin'

export type JwtPayload = {
  sub?: string
  exp?: number
  iat?: number
  phone?: string
  role?: JwtRole | string
  [key: string]: unknown
}

function decodeBase64Url(value: string): string | null {
  try {
    const normalized = value.replace(/-/g, '+').replace(/_/g, '/')
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=')
    return window.atob(padded)
  } catch {
    return null
  }
}

export function decodeJwtPayload(token: string | null | undefined): JwtPayload | null {
  if (!token) return null

  const parts = token.split('.')
  if (parts.length < 2) return null

  const decoded = decodeBase64Url(parts[1])
  if (!decoded) return null

  try {
    return JSON.parse(decoded) as JwtPayload
  } catch {
    return null
  }
}
