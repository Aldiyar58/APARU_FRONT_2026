import { apiClient } from '../apiClient'
import type { RouteResponse } from '../../types/maps'

export type BackendLatLng = {
  lat: number
  lng: number
}

export type BackendRideStatus = 'searching' | 'assigned' | 'arrived' | 'in_progress' | 'completed'

export type BackendRide = {
  id: number
  user_id: number
  driver_id: number | null
  point_a: BackendLatLng
  point_b: BackendLatLng
  tariff: string
  payment_method: string
  status: BackendRideStatus
  distance_m: number | null
  duration_s: number | null
  created_at: string
  updated_at: string
}

export type RideCreateResponse = {
  ride: BackendRide
  route: RouteResponse | null
  distance: number | null
  eta: number | null
}

export async function createRide(params: {
  pointA: BackendLatLng
  pointB: BackendLatLng
  tariff: string
  paymentMethod: string
}): Promise<RideCreateResponse> {
  const { data } = await apiClient.post<RideCreateResponse>('/ride/create', params)
  return data
}

export async function getRide(rideId: number): Promise<BackendRide> {
  const { data } = await apiClient.get<BackendRide>(`/ride/${rideId}`)
  return data
}
