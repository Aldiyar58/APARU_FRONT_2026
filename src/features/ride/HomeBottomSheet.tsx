import { useTranslation } from 'react-i18next'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Skeleton } from '../../components/ui/Skeleton'
import { useRideStore } from '../../store/rideStore'
import type { Tariff, PaymentMethod } from '../../store/rideStore'
import { formatAddressFromReverse, formatDistanceMeters, formatDurationMs } from '../../utils/format'
import type { ReverseGeocodeResponse } from '../../services/aparuApi'
import { DestinationSearch } from './DestinationSearch'
import { useTripRoute } from './useTripRoute'
import { cn } from '../../utils/cn'
import { BsCash } from 'react-icons/bs'

const TARIFFS: { value: Tariff; label: string; desc: string }[] = [
  { value: 'economy', label: 'Эконом', desc: '350 ₸/км' },
  { value: 'optimal', label: 'Оптимал', desc: '550 ₸/км' },
  { value: 'comfort', label: 'Комфорт', desc: '600 ₸/км' },
  { value: 'business', label: 'Бизнес', desc: '700 ₸/км' },
]

const PAYMENT_METHODS: { value: PaymentMethod; label: string, icon: string }[] = [
  { value: 'cash', label: 'Наличные', icon: 'cash' },
  { value: 'kaspi', label: 'Kaspi', icon: 'payment/kaspi.webp' },
  { value: 'halyq', label: 'Halyk', icon: 'payment/halyq.jpg' },
]

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
  const { t } = useTranslation()
  const pickup = useRideStore((s) => s.pickup)
  const pickupAddress = useRideStore((s) => s.pickupAddress)
  const destination = useRideStore((s) => s.destination)
  const route = useRideStore((s) => s.route)
  const setConfirmOpen = useRideStore((s) => s.setConfirmOpen)
  const clearDestinationAndRoute = useRideStore((s) => s.clearDestinationAndRoute)
  const rideLifecycle = useRideStore((s) => s.rideLifecycle)
  const tariff = useRideStore((s) => s.tariff)
  const setTariff = useRideStore((s) => s.setTariff)
  const paymentMethod = useRideStore((s) => s.paymentMethod)
  const setPaymentMethod = useRideStore((s) => s.setPaymentMethod)

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
                {t('home.from', 'Откуда')}
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
                  {pickup ? displayAddress || t('home.addressReceived', 'Адрес получен') : t('home.awaitingQr', 'Ожидаем точку QR')}
                </p>
              )}
            </div>

            <DestinationSearch />

            {/* Тариф */}
            <div>
              <p className="mb-2 text-xs font-medium uppercase tracking-wider text-graphite-400">
                {t('home.tariff', 'Тариф')}
              </p>
              <div className="grid grid-cols-2 gap-2">
                {TARIFFS.map((tItem) => (
                  <button
                    key={tItem.value}
                    type="button"
                    onClick={() => setTariff(tItem.value)}
                    className={cn(
                      'flex flex-col items-start rounded-xl border px-3 py-2.5 text-left transition-all duration-200',
                      tariff === tItem.value
                        ? 'border-aparu bg-aparu/8 ring-1 ring-aparu/30'
                        : 'border-graphite-200 bg-white active:bg-graphite-50 sm:hover:border-graphite-300',
                    )}
                  >
                    <span
                      className={cn(
                        'text-sm font-semibold',
                        tariff === tItem.value ? 'text-aparu-dark' : 'text-graphite-900',
                      )}
                    >
                      {t(`confirm.tariff.${tItem.value}`, tItem.label)}
                    </span>
                    <span className="text-xs text-graphite-500">{t(`confirm.tariffDesc.${tItem.value}`, tItem.desc)}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Способ оплаты */}
            <div>
              <p className="mb-2 text-xs font-medium uppercase tracking-wider text-graphite-400">
                {t('home.payment', 'Оплата')}
              </p>
              <div className="flex gap-2">
                {PAYMENT_METHODS.map((pm) => (
                  <button
                    key={pm.value}
                    type="button"
                    onClick={() => setPaymentMethod(pm.value)}
                    className={cn(
                      'flex flex-1 flex-col items-center justify-center gap-1 rounded-xl border px-1 py-2 text-sm font-semibold transition-all duration-200',
                      paymentMethod === pm.value
                        ? 'border-aparu bg-aparu/8 text-aparu-dark ring-1 ring-aparu/30'
                        : 'border-graphite-200 bg-white text-graphite-700 active:bg-graphite-50 sm:hover:border-graphite-300',
                    )}
                  >
                    <div className="flex h-5 items-center justify-center">
                      {pm.value === 'cash' ? (
                        <BsCash className={cn('h-5 w-auto', paymentMethod === pm.value ? 'text-aparu-dark' : 'text-graphite-500')} />
                      ) : (
                        <img src={`/${pm.icon}`} alt={pm.label} className="h-full w-auto object-contain mix-blend-multiply rounded-[2px]" />
                      )}
                    </div>
                    <span>{t(`confirm.payment.${pm.value}`, pm.label)}</span>
                  </button>
                ))}
              </div>
            </div>

            {destination && (
              <div className="flex flex-wrap items-center gap-3 rounded-xl bg-graphite-50 px-3 py-3 text-sm sm:px-4">
                {routeQ.isFetching && (
                  <span className="text-graphite-500">{t('home.routing', 'Маршрут…')}</span>
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
              {t('home.orderBtn', 'Заказать')}
            </Button>
            {destination && rideLifecycle === 'idle' && (
              <Button
                variant="ghost"
                className="min-h-11 w-full md:min-h-0"
                onClick={() => clearDestinationAndRoute()}
              >
                {t('home.resetBBtn', 'Сбросить точку B')}
              </Button>
            )}
          </div>
        </div>
      </Card>
    </div>
  )
}
