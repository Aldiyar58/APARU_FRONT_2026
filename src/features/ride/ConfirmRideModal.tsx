import { useEffect, useMemo, useState } from 'react'
import { FaCreditCard, FaLock, FaTaxi } from 'react-icons/fa6'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { sendOtpCode, verifyOtp } from '../../services/backend/authApi'
import { createRide, createRideFromQr } from '../../services/backend/rideApi'
import { useAuthStore } from '../../store/authStore'
import { useRideStore } from '../../store/rideStore'
import { useUiStore } from '../../store/uiStore'
import { formatDistanceMeters, formatDurationMs } from '../../utils/format'
import { cn } from '../../utils/cn'

const TARIFF_LABELS: Record<string, string> = {
  economy: 'Эконом',
  optimal: 'Оптимальный',
  comfort: 'Комфорт',
  business: 'Бизнес',
}

const TARIFF_COEFS: Record<string, number> = {
  economy: 150,
  optimal: 200,
  comfort: 250,
  business: 350,
}

const PAYMENT_LABELS: Record<string, string> = {
  cash: 'Наличные',
  kaspi: 'Kaspi',
  halyq: 'Halyk',
}

export function ConfirmRideModal() {
  const open = useRideStore((s) => s.confirmOpen)
  const setConfirmOpen = useRideStore((s) => s.setConfirmOpen)
  const pickup = useRideStore((s) => s.pickup)
  const pickupAddress = useRideStore((s) => s.pickupAddress)
  const destination = useRideStore((s) => s.destination)
  const destinationLabel = useRideStore((s) => s.destinationLabel)
  const route = useRideStore((s) => s.route)
  const applyRide = useRideStore((s) => s.applyRide)
  const setRoute = useRideStore((s) => s.setRoute)
  const tariff = useRideStore((s) => s.tariff)
  const paymentMethod = useRideStore((s) => s.paymentMethod)
  const pendingOrder = useRideStore((s) => s.pendingOrder)
  const setPendingOrder = useRideStore((s) => s.setPendingOrder)
  const accessToken = useAuthStore((s) => s.accessToken)
  const setSession = useAuthStore((s) => s.setSession)
  const pushToast = useUiStore((s) => s.pushToast)

  const [submitting, setSubmitting] = useState(false)

  /* ── Inline auth state ── */
  const [authStep, setAuthStep] = useState<'phone' | 'code'>('phone')
  const [phone, setPhone] = useState('')
  const [code, setCode] = useState('')
  const [ttl, setTtl] = useState<number | null>(null)
  const [authBusy, setAuthBusy] = useState(false)

  const canSend = useMemo(() => phone.trim().length >= 5, [phone])
  const canVerify = useMemo(
    () => phone.trim().length >= 5 && code.trim().length >= 4,
    [phone, code],
  )

  /* TTL countdown */
  useEffect(() => {
    if (ttl == null) return
    if (ttl <= 0) {
      setTtl(null)
      return
    }
    const id = setInterval(() => {
      setTtl((t) => (t != null ? t - 1 : t))
    }, 1000)
    return () => clearInterval(id)
  }, [ttl])

  /* Reset inline auth when modal closes */
  useEffect(() => {
    if (!open) {
      setAuthStep('phone')
      setPhone('')
      setCode('')
      setTtl(null)
      setAuthBusy(false)
    }
  }, [open])

  /* Auto-submit ride after user just authenticated */
  useEffect(() => {
    if (!pendingOrder || !accessToken || !open) return
    if (!pickup || !destination) return

    setPendingOrder(false)
    setSubmitting(true)

    const qrPointId = useRideStore.getState().qrPointId
    const apiCall = qrPointId
      ? createRideFromQr({ qrPointId, pointB: destination, tariff, paymentMethod })
      : createRide({ pointA: pickup, pointB: destination, tariff, paymentMethod })

    apiCall
      .then((response) => {
        if (response.route) setRoute(response.route)
        applyRide(response.ride)
        pushToast(`Поездка #${response.ride.id} создана.`, 'success')
      })
      .catch((error) => {
        pushToast((error as Error).message, 'error')
      })
      .finally(() => setSubmitting(false))
  }, [
    pendingOrder,
    accessToken,
    open,
    pickup,
    destination,
    tariff,
    paymentMethod,
    setPendingOrder,
    setRoute,
    applyRide,
    pushToast,
  ])

  if (!open) return null

  const isGuest = !accessToken

  return (
    <div
      className="fixed inset-0 z-[1500] flex items-end justify-center bg-graphite-900/45 backdrop-blur-[2px] sm:items-center sm:bg-graphite-900/40 sm:p-4 sm:backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-title"
    >
      <Card
        className={cn(
          'w-full max-h-[min(92dvh,640px)] max-w-md animate-[fadeUp_0.28s_ease-out] overflow-hidden p-0 shadow-[var(--shadow-float)]',
          'rounded-t-[1.35rem] rounded-b-none ring-0 sm:rounded-xl sm:p-6 sm:ring-1 sm:ring-graphite-100/80',
        )}
      >
        <div className="flex max-h-[min(92dvh,640px)] flex-col sm:max-h-none">
          <div className="flex shrink-0 justify-center pb-1 pt-2.5 sm:hidden" aria-hidden>
            <span className="h-1 w-11 rounded-full bg-graphite-200" />
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain px-4 pb-2 pt-2 [-webkit-overflow-scrolling:touch] sm:overflow-visible sm:p-0 sm:pt-0">
            <h2 id="confirm-title" className="text-lg font-semibold tracking-tight text-graphite-900 sm:text-xl">
              Подтверждение поездки
            </h2>
            <p className="mt-2 text-sm text-graphite-500">
              Проверьте данные и нажмите «Подтвердить» для создания заказа.
            </p>
            <ul className="mt-5 space-y-3 text-sm">
              <li className="flex gap-2">
                <span className="shrink-0 font-medium text-graphite-400">A</span>
                <span className="min-w-0 break-words text-graphite-800">{pickupAddress || 'Точка подачи'}</span>
              </li>
              <li className="flex gap-2">
                <span className="shrink-0 font-medium text-graphite-400">B</span>
                <span className="min-w-0 break-words text-graphite-800">{destinationLabel || 'Место назначения'}</span>
              </li>
              <li className="flex gap-2 items-center">
                <span className="shrink-0 font-medium text-graphite-400"><FaTaxi /></span>
                <span className="text-graphite-800">{TARIFF_LABELS[tariff] ?? tariff}</span>
              </li>
              <li className="flex gap-2 items-center">
                <span className="shrink-0 font-medium text-graphite-400"><FaCreditCard /></span>
                <span className="text-graphite-800">{PAYMENT_LABELS[paymentMethod] ?? paymentMethod}</span>
              </li>
              <li className="flex flex-wrap gap-2 pt-1 text-graphite-600">
                <span className="font-semibold text-graphite-900">{formatDistanceMeters(route?.Distance)}</span>
                <span className="text-graphite-300">·</span>
                <span>{formatDurationMs(route?.Time)}</span>
                {route?.Distance && (
                  <>
                    <span className="text-graphite-300">·</span>
                    <span className="font-semibold text-graphite-900">
                      {Math.round((route.Distance / 1000) * TARIFF_COEFS[tariff])} ₸
                    </span>
                  </>
                )}
              </li>
            </ul>

            {/* ── Inline auth form for guests ── */}
            {isGuest && (
              <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4">
                <p className="mb-3 text-sm font-medium text-amber-800 flex items-center gap-1.5">
                  <FaLock className="shrink-0" /> Для создания заказа необходимо войти в аккаунт
                </p>

                {authStep === 'phone' && (
                  <div className="space-y-2.5">
                    <Input
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+7..."
                      className="bg-white"
                    />
                    <Button
                      type="button"
                      className="min-h-11 w-full text-[14px]"
                      disabled={!canSend || authBusy}
                      onClick={async () => {
                        setAuthBusy(true)
                        try {
                          const r = await sendOtpCode(phone.trim())
                          setTtl(r.ttl_seconds)
                          setAuthStep('code')
                          pushToast('Код отправлен', 'success')
                        } catch (e) {
                          pushToast((e as Error).message, 'error')
                        } finally {
                          setAuthBusy(false)
                        }
                      }}
                    >
                      {authBusy ? 'Отправка...' : 'Получить код'}
                    </Button>
                  </div>
                )}

                {authStep === 'code' && (
                  <div className="space-y-2.5">
                    <Input
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      inputMode="numeric"
                      placeholder="0000"
                      className="bg-white"
                    />
                    <Button
                      type="button"
                      className="min-h-11 w-full text-[14px]"
                      disabled={!canVerify || authBusy}
                      onClick={async () => {
                        setAuthBusy(true)
                        try {
                          const r = await verifyOtp(phone.trim(), code.trim())
                          setPendingOrder(true)
                          setSession(r.access_token)
                          pushToast('Вы авторизованы! Создаём заказ...', 'success')
                        } catch (e) {
                          pushToast((e as Error).message, 'error')
                        } finally {
                          setAuthBusy(false)
                        }
                      }}
                    >
                      {authBusy ? 'Проверка...' : 'Войти и заказать'}
                    </Button>
                    <div className="flex items-center justify-between">
                      <button
                        type="button"
                        className="text-xs text-graphite-500 hover:underline"
                        onClick={() => setAuthStep('phone')}
                      >
                        Изменить номер
                      </button>
                      {ttl != null && ttl > 0 && (
                        <p className="text-xs text-graphite-500">
                          Код действует {ttl} сек.
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="shrink-0 space-y-2 border-t border-graphite-100 bg-white px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4 sm:border-0 sm:bg-transparent sm:p-0 sm:pb-0 sm:pt-6">
            <div className="flex flex-col gap-2 sm:flex-row-reverse">
              {!isGuest && (
                <Button
                  className="min-h-12 w-full sm:min-h-0 sm:flex-1"
                  disabled={submitting}
                  onClick={async () => {
                    if (!pickup || !destination) {
                      pushToast('Укажите обе точки маршрута.', 'error')
                      return
                    }

                    setSubmitting(true)
                    try {
                      const qrPointId = useRideStore.getState().qrPointId
                      const apiCall = qrPointId
                        ? createRideFromQr({ qrPointId, pointB: destination, tariff, paymentMethod })
                        : createRide({
                            pointA: pickup,
                            pointB: destination,
                            tariff,
                            paymentMethod,
                          })
                      const response = await apiCall
                      if (response.route) {
                        setRoute(response.route)
                      }
                      applyRide(response.ride)
                      pushToast(`Поездка #${response.ride.id} создана.`, 'success')
                    } catch (error) {
                      pushToast((error as Error).message, 'error')
                    } finally {
                      setSubmitting(false)
                    }
                  }}
                >
                  {submitting ? 'Создание...' : 'Подтвердить'}
                </Button>
              )}
              <Button
                variant="ghost"
                className="min-h-12 w-full sm:min-h-0 sm:flex-1"
                disabled={submitting}
                onClick={() => setConfirmOpen(false)}
              >
                Назад
              </Button>
            </div>
          </div>
        </div>
      </Card>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
