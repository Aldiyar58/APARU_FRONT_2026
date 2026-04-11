import axios, { type AxiosError } from 'axios'
import { getApiBaseUrl } from '../config/env'
import { useAuthStore } from '../store/authStore'

export const apiClient = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: 30_000,
  headers: { Accept: 'application/json' },
})

apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

function pickMessage(data: unknown): string {
  if (data == null) return 'Request failed'
  if (typeof data === 'string') return data
  if (typeof data === 'object') {
    const d = data as Record<string, unknown>
    const detail = d.detail
    if (typeof detail === 'string') return detail
    if (Array.isArray(detail)) return JSON.stringify(detail)
    if (detail && typeof detail === 'object') {
      const inner = (detail as Record<string, unknown>).message
      if (typeof inner === 'string') return inner
    }
    const msg = d.message
    if (typeof msg === 'string') return msg
    const code = d.code
    if (typeof code === 'string' && typeof detail === 'string') return `${code}: ${detail}`
  }
  return 'Request failed'
}

apiClient.interceptors.response.use(
  (r) => r,
  (err: AxiosError) => {
    const status = err.response?.status
    const msg = pickMessage(err.response?.data)
    if (status === 401) {
      useAuthStore.getState().clearSession()
    }
    return Promise.reject(new Error(msg || err.message || 'Network error'))
  },
)
