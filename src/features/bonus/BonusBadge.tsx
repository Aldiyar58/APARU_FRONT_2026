import { useBonusStore } from '../../store/bonusStore'
import { cn } from '../../utils/cn'

export function BonusBadge({
  onOpen,
  className,
}: {
  onOpen: () => void
  className?: string
}) {
  const balance = useBonusStore((s) => s.balance)

  return (
    <button
      type="button"
      onClick={onOpen}
      className={cn(
        'flex min-h-11 min-w-11 items-center gap-2 rounded-full bg-white/95 px-3.5 py-2 text-sm font-semibold text-graphite-800 shadow-[var(--shadow-card)] ring-1 ring-graphite-100 backdrop-blur transition active:scale-[0.98] sm:min-h-0 sm:min-w-0 sm:px-3 sm:py-1.5 sm:active:scale-100',
        className,
      )}
    >
      <span
        className="inline-flex h-2 w-2 shrink-0 rounded-full bg-aparu"
        aria-hidden
      />
      <span className="tabular-nums">{balance} ₸</span>
    </button>
  )
}
