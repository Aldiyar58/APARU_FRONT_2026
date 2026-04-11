import { apiClient } from '../apiClient'
import type { RouteResponse } from '../../types/maps'

export type BackendGeocodeItem = { address: string; lat: number; lng: number }

export type ReverseGeocodeNormalized = {
  address: string | null
  lat: number
  lng: number
}

export async function geocodeBackend(text: string, lat?: number, lng?: number): Promise<BackendGeocodeItem[]> {
  const { data } = await apiClient.post<BackendGeocodeItem[]>('/maps/geocode', {
    text,
    lat,
    lng,
  })
  return Array.isArray(data) ? data : []
}

export async function reverseGeocodeBackend(lat: number, lng: number): Promise<ReverseGeocodeNormalized> {
  const { data } = await apiClient.post<ReverseGeocodeNormalized>('/maps/reverse-geocode', { lat, lng })
  return data
}

export async function fetchRouteBackend(points: { lat: number; lng: number }[]): Promise<RouteResponse> {
  const { data } = await apiClient.post<RouteResponse>('/maps/route', { points })
  return data
}
