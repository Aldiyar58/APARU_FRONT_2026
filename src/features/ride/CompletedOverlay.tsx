import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { useRideStore } from '../../store/rideStore'
import { cn } from '../../utils/cn'

export function CompletedOverlay() {
  const rideLifecycle = useRideStore((s) => s.rideLifecycle)
  const resetRideSession = useRideStore((s) => s.resetRideSession)

  if (rideLifecycle !== 'completed') return null

  return (
    <div
      className="fixed inset-0 z-[1600] flex items-end justify-center bg-graphite-900/40 p-0 backdrop-blur-[2px] sm:items-center sm:p-4 sm:backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Поездка завершена"
    >
      <Card
        className={cn(
          'w-full max-w-md space-y-5 p-0 text-center shadow-[var(--shadow-float)]',
          'rounded-t-[1.35rem] rounded-b-none ring-0 sm:rounded-xl sm:p-8 sm:ring-1 sm:ring-graphite-100/80',
        )}
      >
        <div className="flex justify-center pt-3 sm:hidden" aria-hidden>
          <span className="h-1 w-11 rounded-full bg-graphite-200" />
        </div>
        <div className="space-y-5 px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-4 sm:p-8 sm:pb-8 sm:pt-0">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-aparu/15 text-2xl">
            ✓
          </div>
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-graphite-900 sm:text-2xl">
              Поездка завершена
            </h2>
            <p className="mt-2 text-sm text-graphite-500">
              Спасибо, что выбрали APARU. Скачайте приложение для бонусов и истории
              поездок.
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <Button
              className="min-h-12 w-full sm:min-h-0"
              onClick={() =>
                window.open('https://aparu.kz', '_blank', 'noopener,noreferrer')
              }
            >
              Скачать приложение
            </Button>
            <Button
              variant="secondary"
              className="min-h-12 w-full sm:min-h-0"
              onClick={() => resetRideSession()}
            >
              Новая поездка
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
