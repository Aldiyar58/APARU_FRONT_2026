import { create } from 'zustand'

export type ToastTone = 'success' | 'error' | 'info'

export type ToastState = {
  message: string
  tone: ToastTone
} | null

type UiState = {
  bonusScreenOpen: boolean
  setBonusScreenOpen: (open: boolean) => void
  toast: ToastState
  pushToast: (message: string, tone?: ToastTone) => void
  clearToast: () => void
}

export const useUiStore = create<UiState>((set) => ({
  bonusScreenOpen: false,
  setBonusScreenOpen: (bonusScreenOpen) => set({ bonusScreenOpen }),

  toast: null,
  pushToast: (message, tone = 'info') => set({ toast: { message, tone } }),
  clearToast: () => set({ toast: null }),
}))
