import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Skeleton } from '../../components/ui/Skeleton'
import { useRideStore } from '../../store/rideStore'
import { formatAddressFromReverse, formatDistanceMeters, formatDurationMs } from '../../utils/format'
import type { ReverseGeocodeResponse } from '../../services/aparuApi'
import { DestinationSearch } from './DestinationSearch'
import { useTripRoute } from './useTripRoute'
import { cn } from '../../utils/cn'

export function HomeBottomSheet({
  reverseLoading,
  reverseError,
  reverseData,
  entryAddress,
}: {
  reverseLoading: boolean
  reverseError: Error | null
  reverseData: ReverseGeocodeResponse | undefined
  /** Адрес из `GET /api/v1/entry` (Aparu reverse-geocode на бэкенде) */
  entryAddress?: string | null
}) {
  const pickup = useRideStore((s) => s.pickup)
  const pickupAddress = useRideStore((s) => s.pickupAddress)
  const destination = useRideStore((s) => s.destination)
  const route = useRideStore((s) => s.route)
  const setConfirmOpen = useRideStore((s) => s.setConfirmOpen)
  const clearDestinationAndRoute = useRideStore((s) => s.clearDestinationAndRoute)
  const rideLifecycle = useRideStore((s) => s.rideLifecycle)

  const routeQ = useTripRoute()
  const displayAddress =
    (entryAddress && entryAddress.trim()) ||
    pickupAddress ||
    (reverseData ? formatAddressFromReverse(reverseData) : '')

  const canOrder =
    rideLifecycle === 'idle' &&
    !!destination &&
    !!route?.Coordinates?.length &&
    !routeQ.isFetching

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[500] flex justify-center md:p-4 md:pb-[max(1rem,env(safe-area-inset-bottom))]">
      <Card
        className={cn(
          'pointer-events-auto w-full max-w-lg overflow-hidden p-0 transition-all duration-300',
          'rounded-t-[1.35rem] rounded-b-none shadow-[0_-10px_44px_-12px_rgba(0,0,0,0.14)] ring-0',
          'md:rounded-xl md:p-5 md:shadow-[var(--shadow-card)] md:ring-1 md:ring-graphite-100/80',
        )}
      >
        <div className="flex max-h-[min(58dvh,480px)] flex-col md:max-h-none">
          <div
            className="flex shrink-0 justify-center pt-2.5 pb-1 md:hidden"
            aria-hidden
          >
            <span className="h-1 w-11 rounded-full bg-graphite-200" />
          </div>

          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-y-contain px-4 pb-2 pt-1 [-webkit-overflow-scrolling:touch] md:overflow-visible md:p-0 md:pt-0">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-graphite-400">
                Откуда
              </p>
              {reverseLoading && (
                <div className="mt-2 space-y-2">
                  <Skeleton className="h-5 w-full max-w-[92%]" />
                  <Skeleton className="h-5 w-full max-w-[70%]" />
                </div>
              )}
              {!reverseLoading && reverseError && (
                <p className="mt-1 text-sm text-red-600">{reverseError.message}</p>
              )}
              {!reverseLoading && !reverseError && (
                <p className="mt-1 text-base font-medium leading-snug text-graphite-900 sm:text-[17px]">
                  {pickup ? displayAddress || 'Адрес получен' : 'Ожидаем точку QR'}
                </p>
              )}
            </div>

            <DestinationSearch />

            {destination && (
              <div className="flex flex-wrap items-center gap-3 rounded-xl bg-graphite-50 px-3 py-3 text-sm sm:px-4">
                {routeQ.isFetching && (
                  <span className="text-graphite-500">Маршрут…</span>
                )}
                {routeQ.isError && (
                  <span className="text-red-600">
                    {(routeQ.error as Error).message}
                  </span>
                )}
                {!routeQ.isFetching && route && (
                  <>
                    <span className="font-semibold text-graphite-900">
                      {formatDistanceMeters(route.Distance)}
                    </span>
                    <span className="text-graphite-300">·</span>
                    <span className="text-graphite-600">
                      {formatDurationMs(route.Time)}
                    </span>
                  </>
                )}
              </div>
            )}
          </div>

          <div className="shrink-0 space-y-2 border-t border-graphite-100 bg-white px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 md:border-0 md:bg-transparent md:p-0 md:pb-0 md:pt-0">
            <Button
              className="min-h-12 w-full md:min-h-0"
              disabled={!canOrder}
              onClick={() => setConfirmOpen(true)}
            >
              Заказать
            </Button>
            {destination && rideLifecycle === 'idle' && (
              <Button
                variant="ghost"
                className="min-h-11 w-full md:min-h-0"
                onClick={() => clearDestinationAndRoute()}
              >
                Сбросить точку B
              </Button>
            )}
          </div>
        </div>
      </Card>
    </div>
  )
}
