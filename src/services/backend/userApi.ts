import { apiClient } from '../apiClient'
import type { BackendRide } from './rideApi'

export type MeResponse = {
  profile: {
    id: number
    phone: string
    bonus_balance: number
    role: 'user' | 'driver' | 'admin'
    created_at: string
  }
  rides: BackendRide[]
}

export async function fetchMe(): Promise<MeResponse> {
  const { data } = await apiClient.get<MeResponse>('/me')
  return data
}
