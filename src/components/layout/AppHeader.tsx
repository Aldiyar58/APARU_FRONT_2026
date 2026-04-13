import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { BonusBadge } from '../../features/bonus/BonusBadge'
import { useAuthStore } from '../../store/authStore'
import { useUiStore } from '../../store/uiStore'

export function AppHeader() {
  const { t, i18n } = useTranslation()
  const setBonusScreenOpen = useUiStore((s) => s.setBonusScreenOpen)
  const token = useAuthStore((s) => s.accessToken)
  const role = useAuthStore((s) => s.role)
  const clearSession = useAuthStore((s) => s.clearSession)

  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language === 'ru' ? 'kk' : 'ru')
  }

  return (
    <header
      className="pointer-events-none absolute left-0 right-0 top-0 z-[1000] flex items-start justify-between gap-4 px-4 pt-[max(1rem,env(safe-area-inset-top))] pr-[max(1rem,env(safe-area-inset-right))] pl-[max(1rem,env(safe-area-inset-left))] pb-4 sm:p-6 sm:pt-6"
    >
      <div className="pointer-events-auto flex min-w-0 flex-col gap-1 sm:gap-1.5">
        <span className="text-xs font-bold uppercase tracking-widest text-graphite-500 sm:text-sm">
          {t('header.brand', 'APARU')}
        </span>
        <span className="truncate text-2xl font-bold tracking-tight text-graphite-900 sm:text-3xl leading-none">
          {t('header.title', 'QR Taxi')}
        </span>
        <div className="pointer-events-auto mt-2.5 flex flex-col gap-2.5 text-sm font-semibold sm:flex-row sm:items-center sm:gap-5 sm:text-base">
          <div className="flex flex-wrap items-center gap-4">
            {/* {!token && (
            <Link className="text-aparu-dark hover:underline" to="/auth/login">
              {t('header.login', 'Войти')}
            </Link>
          )} */}
            {token && role === 'admin' && (
              <Link className="text-aparu-dark hover:underline" to="/admin/dashboard">
                {t('header.admin', 'Админ')}
              </Link>
            )}
            {token && role === 'driver' && (
              <Link className="text-aparu-dark hover:underline" to="/driver/active-rides">
                {t('header.driver', 'Водитель')}
              </Link>
            )}
            {token && (
              <button
                type="button"
                className="text-graphite-500 hover:text-graphite-800"
                onClick={() => clearSession()}
              >
                {t('header.logout', 'Выйти')}
              </button>
            )}
          </div>
          <button
            type="button"
            onClick={toggleLanguage}
            className="text-aparu-primary hover:text-aparu-dark font-bold underline decoration-dotted underline-offset-4 self-start sm:self-auto"
          >
            {i18n.language === 'ru' ? 'ҚАЗ' : 'РУС'}
          </button>
        </div>
      </div>
      <div className="pointer-events-auto">
        <BonusBadge onOpen={() => setBonusScreenOpen(true)} />
      </div>
    </header>
  )
}
