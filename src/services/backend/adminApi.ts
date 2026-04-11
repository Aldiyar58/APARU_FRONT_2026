import { apiClient } from '../apiClient'

export type BackendQrPoint = {
  id: number
  name: string
  lat: number
  lng: number
  created_at: string
}

export type QrGenerateResponse = {
  qr_point: BackendQrPoint
  qr_base64: string
  url: string
}

export async function fetchQrPoints(): Promise<BackendQrPoint[]> {
  const { data } = await apiClient.get<BackendQrPoint[]>('/admin/qr')
  return data
}

export async function generateQrPoint(params: {
  name: string
  lat: number
  lng: number
}): Promise<QrGenerateResponse> {
  const { data } = await apiClient.post<QrGenerateResponse>('/admin/qr/generate', params)
  return data
}
