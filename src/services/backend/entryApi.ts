import { apiClient } from '../apiClient'

export type EntryResponse = {
  lat: number
  lng: number
  address: string | null
  bonus_balance: number
}

export async function fetchQrEntry(params: {
  lat: number
  lng: number
  pointId: string
}): Promise<EntryResponse> {
  const { data } = await apiClient.get<EntryResponse>('/entry', {
    params: {
      lat: params.lat,
      lng: params.lng,
      point_id: params.pointId,
    },
  })
  return data
}
