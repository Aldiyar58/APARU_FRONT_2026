import { Link } from 'react-router-dom'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { getPublicWebBaseUrl } from '../../config/env'
import { cn } from '../../utils/cn'

function demoUrl(): string {
  const qs = new URLSearchParams({
    lat: '49.9483',
    lng: '82.6135',
    point_id: 'demo-point',
  })
  return `/entry?${qs.toString()}`
}

export function QrEntryGate() {
  const demo = demoUrl()

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
          Откройте ссылку из QR
        </h1>
        <p className="mx-auto mt-3 max-w-md text-sm text-graphite-500">
          В ссылке должны быть <span className="font-semibold">lat</span>,{' '}
          <span className="font-semibold">lng</span> и{' '}
          <span className="font-semibold">point_id</span> (или legacy <span className="font-semibold">id</span>).
          После входа бонус +10 за скан начисляется на сервере.
        </p>
        <p className="mx-auto mt-2 max-w-md text-xs text-graphite-400">
          API base: <span className="font-mono">{getPublicWebBaseUrl() || '(same origin)'}/api/v1</span>
        </p>
      </div>
      <Card className="w-full max-w-md space-y-4 p-5 sm:p-6">
        <p className="text-sm text-graphite-600">Демо-ссылка (Павлодар, тестовый сценарий):</p>
        <code className="block max-h-32 overflow-auto break-all rounded-lg bg-graphite-100 px-3 py-2 text-left text-xs text-graphite-700 [-webkit-overflow-scrolling:touch]">
          {demo}
        </code>
        <Button
          className="min-h-12 w-full sm:min-h-0"
          onClick={() => {
            window.location.assign(demo)
          }}
        >
          Открыть демо-точку
        </Button>
        <Link
          to="/auth/login"
          className={cn(
            'inline-flex min-h-12 w-full items-center justify-center rounded-xl px-5 py-3.5 text-[16px] font-semibold tracking-tight text-graphite-700 transition sm:min-h-0 sm:text-[15px]',
            'bg-transparent hover:bg-graphite-100 active:bg-graphite-200',
          )}
        >
          Войти по SMS
        </Link>
      </Card>
    </div>
  )
}
