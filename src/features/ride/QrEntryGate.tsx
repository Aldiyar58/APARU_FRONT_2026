import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'

const DEMO_URL =
  `${typeof window !== 'undefined' ? window.location.pathname : '/'}?lat=49.9483&lng=82.6135&id=point123`

export function QrEntryGate() {
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
          Точка подачи передаётся в ссылке (lat, lng, id). Для демо можно открыть
          пример ниже.
        </p>
      </div>
      <Card className="w-full max-w-md space-y-4 p-5 sm:p-6">
        <p className="text-sm text-graphite-600">
          Пример для инвесторов и теста API (Павлодар, тестовый стенд):
        </p>
        <code className="block max-h-32 overflow-auto break-all rounded-lg bg-graphite-100 px-3 py-2 text-left text-xs text-graphite-700 [-webkit-overflow-scrolling:touch]">
          {DEMO_URL}
        </code>
        <Button
          className="min-h-12 w-full sm:min-h-0"
          onClick={() => {
            window.location.href = DEMO_URL
          }}
        >
          Открыть демо-точку
        </Button>
      </Card>
    </div>
  )
}
