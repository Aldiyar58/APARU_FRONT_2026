import { apiClient } from '../apiClient'
import type { BackendRide } from './rideApi'

export async function fetchAvailableDriverRides(): Promise<BackendRide[]> {
  const { data } = await apiClient.get<BackendRide[]>('/driver/rides/available')
  return data
}

export async function updateDriverLocation(lat: number, lng: number): Promise<void> {
  await apiClient.patch('/driver/me/location', { lat, lng })
}

async function driverRideAction(rideId: number, action: 'accept' | 'arrived' | 'start' | 'complete'): Promise<BackendRide> {
  const { data } = await apiClient.post<BackendRide>(`/driver/rides/${rideId}/${action}`)
  return data
}

export function acceptDriverRide(rideId: number): Promise<BackendRide> {
  return driverRideAction(rideId, 'accept')
}

export function markDriverRideArrived(rideId: number): Promise<BackendRide> {
  return driverRideAction(rideId, 'arrived')
}

export function startDriverRide(rideId: number): Promise<BackendRide> {
  return driverRideAction(rideId, 'start')
}

export function completeDriverRide(rideId: number): Promise<BackendRide> {
  return driverRideAction(rideId, 'complete')
}
