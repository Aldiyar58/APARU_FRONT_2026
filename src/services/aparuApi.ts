/**
 * Maps integration: all calls go through our FastAPI backend (`/api/v1/maps/*`),
 * never directly to Aparu from the browser in production.
 */
import { fetchRouteBackend, geocodeBackend, reverseGeocodeBackend } from './backend/mapsApi'
import type {
  GeocodeResultItem,
  ReverseGeocodeResponse,
  RoutePoint,
  RouteResponse,
} from '../types/maps'

export type {
  AparuCoordPair,
  GeocodeResultItem,
  ReverseGeocodeResponse,
  RoutePoint,
  RouteResponse,
} from '../types/maps'

export type GeocodeResponse = {
  Results?: GeocodeResultItem[]
}

export async function reverseGeocode(latitude: number, longitude: number): Promise<ReverseGeocodeResponse> {
  const r = await reverseGeocodeBackend(latitude, longitude)
  return {
    PlaceName: r.address ?? undefined,
    AreaName: undefined,
    Locality: {
      Name: r.address ?? undefined,
      Latitude: r.lat,
      Longitude: r.lng,
    },
  }
}

export async function geocode(text: string, latitude: number, longitude: number): Promise<GeocodeResponse> {
  const items = await geocodeBackend(text, latitude, longitude)
  const Results: GeocodeResultItem[] = items.map((it) => ({
    PlaceName: it.address,
    Locality: { Latitude: it.lat, Longitude: it.lng, Name: it.address },
  }))
  return { Results }
}

export async function fetchRoute(points: RoutePoint[]): Promise<RouteResponse> {
  const leaflet = points.map((p) => ({ lat: p.Latitude, lng: p.Longitude }))
  return fetchRouteBackend(leaflet)
}
