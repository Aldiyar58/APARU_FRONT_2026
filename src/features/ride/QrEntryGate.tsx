import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { Card } from '../../components/ui/Card'
import { getPublicWebBaseUrl } from '../../config/env'
import { cn } from '../../utils/cn'

export function QrEntryGate() {
  const { t } = useTranslation()
  return (
    <div
      className="flex min-h-[100dvh] flex-col items-center justify-center gap-6 overflow-y-auto bg-graphite-50 px-4 py-8"
      style={{
        paddingTop: 'max(1.5rem, env(safe-area-inset-top))',
        paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom))',
        paddingLeft: 'max(1rem, env(safe-area-inset-left))',
        paddingRight: 'max(1rem, env(safe-area-inset-right))',
      }}
    >
      <div className="text-center">
        <p className="text-xs font-semibold uppercase tracking-wider text-graphite-400">
          APARU QR Taxi
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-graphite-900 sm:text-3xl">
          {t('qr.title', 'Откройте ссылку из QR')}
        </h1>
        <p className="mx-auto mt-3 max-w-md text-sm text-graphite-500">
          {t('qr.desc1', 'В ссылке должен быть')} <span className="font-semibold">point_id</span>. {t('qr.desc2', 'После входа бонус +10 за скан начисляется на сервере.')}
        </p>
        <p className="mx-auto mt-2 max-w-md text-xs text-graphite-400">
          API base: <span className="font-mono">{getPublicWebBaseUrl() || '(same origin)'}/api/v1</span>
        </p>
      </div>
      <Card className="w-full max-w-md space-y-4 p-5 sm:p-6">
        <Link
          to="/auth/login"
          className={cn(
            'inline-flex min-h-12 w-full items-center justify-center rounded-xl border border-graphite-200 bg-white px-5 py-3.5 text-[16px] font-semibold tracking-tight text-graphite-900 transition hover:bg-graphite-50 sm:min-h-0 sm:text-[15px]',
          )}
        >
          {t('qr.loginBtn', 'Войти по SMS')}
        </Link>
      </Card>
    </div>
  )
}
