import { apiClient } from '../apiClient'

export type BackendBonusTransaction = {
  id: number
  amount: number
  type: 'scan' | 'ride' | 'reward' | 'redeem'
  ride_id: number | null
  created_at: string
}

export type BonusSummaryResponse = {
  balance: number
  transactions: BackendBonusTransaction[]
}

export type BonusRedeemResponse = {
  discount_percent: number
  points_spent: number
  new_balance: number
}

export async function fetchBonusSummary(): Promise<BonusSummaryResponse> {
  const { data } = await apiClient.get<BonusSummaryResponse>('/bonus/')
  return data
}

export async function redeemBonus(points: number): Promise<BonusRedeemResponse> {
  const { data } = await apiClient.post<BonusRedeemResponse>('/bonus/redeem', { points })
  return data
}
