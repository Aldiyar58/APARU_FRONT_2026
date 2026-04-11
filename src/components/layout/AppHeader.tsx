import { Link } from 'react-router-dom'
import { BonusBadge } from '../../features/bonus/BonusBadge'
import { useAuthStore } from '../../store/authStore'
import { useUiStore } from '../../store/uiStore'
export function AppHeader() {
  const setBonusScreenOpen = useUiStore((s) => s.setBonusScreenOpen)
  const token = useAuthStore((s) => s.accessToken)
  const role = useAuthStore((s) => s.role)
  const clearSession = useAuthStore((s) => s.clearSession)

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
        <div className="pointer-events-auto mt-1 flex flex-wrap gap-x-3 gap-y-1 text-[11px] font-semibold sm:text-xs">
          {!token && (
            <Link className="text-aparu-dark hover:underline" to="/auth/login">
              Войти
            </Link>
          )}
          {token && role === 'admin' && (
            <Link className="text-aparu-dark hover:underline" to="/admin/dashboard">
              Admin
            </Link>
          )}
          {token && role === 'driver' && (
            <Link className="text-aparu-dark hover:underline" to="/driver/active-rides">
              Водитель
            </Link>
          )}
          {token && (
            <button
              type="button"
              className="text-graphite-500 hover:text-graphite-800"
              onClick={() => clearSession()}
            >
              Выйти
            </button>
          )}
        </div>
      </div>
      <div className="pointer-events-auto">
        <BonusBadge onOpen={() => setBonusScreenOpen(true)} />
      </div>
    </header>
  )
}
