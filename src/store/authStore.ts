import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { decodeJwtPayload, type JwtRole } from '../lib/jwt'

type AuthState = {
  accessToken: string | null
  role: JwtRole | null
  phone: string | null
  /** Server-reported bonus balance when authenticated (synced from /entry, /me). */
  bonusBalance: number | null
  setSession: (token: string) => void
  setBonusBalance: (n: number | null) => void
  clearSession: () => void
}

const storage =
  typeof window !== 'undefined'
    ? createJSONStorage(() => localStorage)
    : undefined

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      role: null,
      phone: null,
      bonusBalance: null,

      setSession: (token) => {
        const payload = decodeJwtPayload(token)
        const role = (payload?.role as JwtRole | undefined) ?? 'user'
        set({
          accessToken: token,
          role,
          phone: typeof payload?.phone === 'string' ? payload.phone : null,
        })
      },

      setBonusBalance: (bonusBalance) => set({ bonusBalance }),

      clearSession: () =>
        set({
          accessToken: null,
          role: null,
          phone: null,
          bonusBalance: null,
        }),
    }),
    {
      name: 'aparu-auth',
      storage,
      partialize: (s) => ({
        accessToken: s.accessToken,
        role: s.role,
        phone: s.phone,
        bonusBalance: s.bonusBalance,
      }),
    },
  ),
)
