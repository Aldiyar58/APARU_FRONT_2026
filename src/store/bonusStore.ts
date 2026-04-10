import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

export type BonusTransaction = {
  id: string
  label: string
  delta: number
  at: number
}

type BonusState = {
  balance: number
  claimedPointIds: string[]
  orderCount: number
  transactions: BonusTransaction[]
  /** +10 за скан QR (один раз на point id) */
  claimScanBonus: (pointId: string | undefined | null) => void
  /** +50 первый заказ, +20 повторный — вызывать при подтверждении поездки */
  awardOrderBonus: () => void
  resetDemo: () => void
}

const storage =
  typeof window !== 'undefined'
    ? createJSONStorage(() => localStorage)
    : undefined

export const useBonusStore = create<BonusState>()(
  persist(
    (set, get) => ({
      balance: 0,
      claimedPointIds: [],
      orderCount: 0,
      transactions: [],

      claimScanBonus: (pointId) => {
        const id = pointId?.trim()
        if (!id) return
        const { claimedPointIds, balance, transactions } = get()
        if (claimedPointIds.includes(id)) return
        const delta = 10
        const tx: BonusTransaction = {
          id: crypto.randomUUID(),
          label: 'Скан QR',
          delta,
          at: Date.now(),
        }
        set({
          balance: balance + delta,
          claimedPointIds: [...claimedPointIds, id],
          transactions: [tx, ...transactions].slice(0, 50),
        })
      },

      awardOrderBonus: () => {
        const { orderCount, balance, transactions } = get()
        const delta = orderCount === 0 ? 50 : 20
        const label = orderCount === 0 ? 'Первый заказ' : 'Поездка'
        const tx: BonusTransaction = {
          id: crypto.randomUUID(),
          label,
          delta,
          at: Date.now(),
        }
        set({
          balance: balance + delta,
          orderCount: orderCount + 1,
          transactions: [tx, ...transactions].slice(0, 50),
        })
      },

      resetDemo: () =>
        set({
          balance: 0,
          claimedPointIds: [],
          orderCount: 0,
          transactions: [],
        }),
    }),
    {
      name: 'aparu-qr-bonus',
      storage,
      partialize: (s) => ({
        balance: s.balance,
        claimedPointIds: s.claimedPointIds,
        orderCount: s.orderCount,
        transactions: s.transactions,
      }),
    },
  ),
)
