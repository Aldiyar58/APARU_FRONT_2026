import { apiClient } from '../apiClient'

export async function sendOtpCode(phone: string): Promise<{ ttl_seconds: number }> {
  const { data } = await apiClient.post<{ ttl_seconds: number }>('/auth/send-code', { phone })
  return data
}

export async function verifyOtp(phone: string, code: string): Promise<{ access_token: string }> {
  const { data } = await apiClient.post<{ access_token: string }>('/auth/verify', { phone, code })
  return data
}
