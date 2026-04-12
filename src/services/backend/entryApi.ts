import { apiClient } from '../apiClient'

export type QrPointResponse = {
  id: number
  name: string
  lat: number
  lng: number
}

export async function fetchQrPoint(id: string): Promise<QrPointResponse> {
  const { data } = await apiClient.get<QrPointResponse>(`/qr-points/${id}`)
  return data
}
