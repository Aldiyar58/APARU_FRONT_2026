import { create } from 'zustand'

type UiState = {
  bonusScreenOpen: boolean
  setBonusScreenOpen: (open: boolean) => void
}

export const useUiStore = create<UiState>((set) => ({
  bonusScreenOpen: false,
  setBonusScreenOpen: (bonusScreenOpen) => set({ bonusScreenOpen }),
}))
