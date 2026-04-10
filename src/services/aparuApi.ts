const API_KEY = 'test1'

function getBaseUrl(): string {
  const fromEnv = import.meta.env.VITE_APARU_BASE as string | undefined
  if (fromEnv?.trim()) return fromEnv.replace(/\/$/, '')
  if (import.meta.env.DEV) return '/aparu-proxy'
  return 'http://testtaxi3.aparu.kz'
}

async function aparuPost<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${getBaseUrl()}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Api-Key': API_KEY,
    },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    let detail = res.statusText
    try {
      const err = (await res.json()) as { Message?: string; title?: string }
      detail = err.Message ?? err.title ?? detail
    } catch {
      /* ignore */
    }
    throw new Error(detail || `HTTP ${res.status}`)
  }
  return res.json() as Promise<T>
}

/** Aparu: [lng, lat] */
export type AparuCoordPair = [number, number]

export interface ReverseGeocodeResponse {
  PlaceName?: string
  AreaName?: string
  AccuratePlace?: boolean
  Locality?: {
    LocalityId?: number
    Name?: string
    Latitude?: number
    Longitude?: number
  }
}

export interface GeocodeResponse {
  Results?: GeocodeResultItem[]
}

export interface GeocodeResultItem {
  PlaceName?: string
  AreaName?: string
  Locality?: {
    Latitude?: number
    Longitude?: number
    Name?: string
  }
}

export interface RoutePoint {
  Longitude: number
  Latitude: number
}

export interface RouteInstruction {
  Distance?: number
  Time?: number
  Text?: string
  StreetName?: string
}

export interface RouteResponse {
  Distance?: number
  Time?: number
  Coordinates?: AparuCoordPair[]
  BBox?: [number, number, number, number]
  Instructions?: RouteInstruction[]
}

export function reverseGeocode(latitude: number, longitude: number) {
  return aparuPost<ReverseGeocodeResponse>('/api/v1/maps/reverse-geocode', {
    latitude,
    longitude,
  })
}

/** Требуются якорные координаты (не нули) и поле Text */
export function geocode(text: string, latitude: number, longitude: number) {
  return aparuPost<GeocodeResponse>('/api/v1/maps/geocode', {
    Text: text,
    Latitude: latitude,
    Longitude: longitude,
  })
}

export function fetchRoute(points: RoutePoint[]) {
  return aparuPost<RouteResponse>('/api/v1/maps/route', { Points: points })
}
