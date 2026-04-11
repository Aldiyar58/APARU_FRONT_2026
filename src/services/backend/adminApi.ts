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

export type CreateDriverRequest = {
  phone: string
  name: string
  vehicle_model?: string | null
  license_plate?: string | null
}

export type DriverVehicleRead = {
  vehicle_model: string | null
  license_plate: string | null
}

export type AdminCreateDriverResponse = {
  profile: {
    id: number
    phone: string
    name: string | null
    bonus_balance: number
    role: 'user' | 'driver' | 'admin'
    created_at: string
  }
  vehicle: DriverVehicleRead
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

export async function createDriver(params: CreateDriverRequest): Promise<AdminCreateDriverResponse> {
  const { data } = await apiClient.post<AdminCreateDriverResponse>('/admin/users/drivers', params)
  return data
}
