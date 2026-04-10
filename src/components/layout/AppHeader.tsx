import { BonusBadge } from '../../features/bonus/BonusBadge'
import { useUiStore } from '../../store/uiStore'

export function AppHeader() {
  const setBonusScreenOpen = useUiStore((s) => s.setBonusScreenOpen)

  return (
    <header
      className="pointer-events-none absolute left-0 right-0 top-0 z-[1000] flex items-start justify-between gap-2 px-3 pt-[max(0.5rem,env(safe-area-inset-top))] pr-[max(0.75rem,env(safe-area-inset-right))] pl-[max(0.75rem,env(safe-area-inset-left))] pb-2 sm:gap-3 sm:p-4 sm:pt-4"
    >
      <div className="pointer-events-auto flex min-w-0 flex-col gap-0.5 sm:gap-1">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-graphite-400 sm:text-[11px]">
          APARU
        </span>
        <span className="truncate text-base font-semibold tracking-tight text-graphite-900 sm:text-lg">
          QR Taxi
        </span>
      </div>
      <div className="pointer-events-auto">
        <BonusBadge onOpen={() => setBonusScreenOpen(true)} />
      </div>
    </header>
  )
}
