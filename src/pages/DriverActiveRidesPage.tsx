import { useMutation, useQuery } from '@tanstack/react-query'
import { FaLocationDot } from 'react-icons/fa6'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import {
  acceptDriverRide,
  completeDriverRide,
  fetchAvailableDriverRides,
  markDriverRideArrived,
  startDriverRide,
  updateDriverLocation,
} from '../services/backend/driverApi'
import type { BackendRide } from '../services/backend/rideApi'
import { queryClient } from '../services/queryClient'
import { useAuthStore } from '../store/authStore'
import { useUiStore } from '../store/uiStore'

/** Haversine distance in kilometres */
function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function coordsLabel(ride: BackendRide): string {
  return `${ride.point_a.lat.toFixed(5)}, ${ride.point_a.lng.toFixed(5)} -> ${ride.point_b.lat.toFixed(5)}, ${ride.point_b.lng.toFixed(5)}`
}

function distanceLabel(driverPos: { lat: number; lng: number } | null, ride: BackendRide, t: any): string | null {
  if (!driverPos) return null
  const km = haversineKm(driverPos.lat, driverPos.lng, ride.point_a.lat, ride.point_a.lng)
  if (km < 1) return t('driver.metersAway', '{{dist}} м от вас', { dist: Math.round(km * 1000) })
  return t('driver.kmAway', '{{dist}} км от вас', { dist: km.toFixed(1) })
}

function nextAction(status: BackendRide['status'], t: any): {
  action: 'arrived' | 'start' | 'complete'
  label: string
} | null {
  if (status === 'assigned') return { action: 'arrived', label: t('driver.arrived', 'Прибыл') }
  if (status === 'arrived') return { action: 'start', label: t('driver.startRide', 'Начать поездку') }
  if (status === 'in_progress') return { action: 'complete', label: t('driver.completeRide', 'Завершить поездку') }
  return null
}

export function DriverActiveRidesPage() {
  const { t } = useTranslation()
  const pushToast = useUiStore((s) => s.pushToast)
  const [activeRide, setActiveRide] = useState<BackendRide | null>(null)
  const [driverPos, setDriverPos] = useState<{ lat: number; lng: number } | null>(null)

  // ── GPS tracking ──
  useEffect(() => {
    if (!navigator.geolocation) return

    let lastPos: { lat: number, lng: number } | null = null

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const p = { lat: pos.coords.latitude, lng: pos.coords.longitude }
        setDriverPos(p)
        lastPos = p
      },
      () => {
        /* ignore errors silently */
      },
      { enableHighAccuracy: true, maximumAge: 5_000 },
    )

    const intervalId = setInterval(() => {
      if (lastPos) {
        updateDriverLocation(lastPos.lat, lastPos.lng).catch(() => {})
      }
    }, 10_000)

    return () => {
      navigator.geolocation.clearWatch(watchId)
      clearInterval(intervalId)
    }
  }, [])

  const availableQ = useQuery({
    queryKey: ['driver-available-rides'],
    queryFn: fetchAvailableDriverRides,
    refetchInterval: activeRide ? false : 5_000,
  })

  const actionMutation = useMutation({
    mutationFn: async (params: { rideId: number; action: 'accept' | 'arrived' | 'start' | 'complete' }) => {
      if (params.action === 'accept') return acceptDriverRide(params.rideId)
      if (params.action === 'arrived') return markDriverRideArrived(params.rideId)
      if (params.action === 'start') return startDriverRide(params.rideId)
      return completeDriverRide(params.rideId)
    },
    onSuccess: async (ride, params) => {
      if (params.action === 'complete') {
        setActiveRide(null)
        pushToast(t('driver.rideCompleted', 'Поездка #{{id}} завершена.', { id: ride.id }), 'success')
      } else {
        setActiveRide(ride)
        pushToast(t('driver.rideStatus', 'Поездка #{{id}}: {{status}}.', { id: ride.id, status: ride.status }), 'success')
      }
      await queryClient.invalidateQueries({ queryKey: ['driver-available-rides'] })
    },
    onError: (error) => {
      pushToast((error as Error).message, 'error')
    },
  })

  const availableRides = availableQ.data ?? []
  const currentNextAction = activeRide ? nextAction(activeRide.status, t) : null

  return (
    <div className="mx-auto max-w-4xl space-y-4 px-4 py-10">
      <Card className="p-6">
        <h1 className="text-2xl font-semibold text-graphite-900">{t('driver.dashboardTitle', 'Панель водителя')}</h1>
        <p className="mt-2 text-sm text-graphite-600">
          {driverPos
            ? `${t('driver.yourLocation', 'Ваше местоположение: ')} ${driverPos.lat.toFixed(5)}, ${driverPos.lng.toFixed(5)}`
            : t('driver.detectingLocation', 'Определяем ваше местоположение…')}
        </p>
        <div className="mt-4 flex items-center gap-4">
          <Link className="text-sm font-semibold text-aparu-dark hover:underline" to="/">
            {t('driver.backToMap', 'На карту')}
          </Link>
          <button
            type="button"
            className="text-sm font-semibold text-graphite-500 hover:text-graphite-800 hover:underline"
            onClick={() => {
              useAuthStore.getState().clearSession()
              pushToast(t('driver.loggedOut', 'Вы вышли из системы'), 'info')
            }}
          >
            {t('driver.logout', 'Выйти')}
          </button>
        </div>
      </Card>

      {activeRide && (
        <Card className="space-y-4 p-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-graphite-400">{t('driver.activeRideTitle', 'Активная поездка')}</p>
            <h2 className="mt-2 text-xl font-semibold text-graphite-900">{t('driver.rideId', 'Поездка #{{id}}', { id: activeRide.id })}</h2>
            <p className="mt-1 text-sm text-graphite-500">{t('driver.statusLabel', 'Статус: {{status}}', { status: activeRide.status })}</p>
            <p className="mt-2 text-sm text-graphite-700">{coordsLabel(activeRide)}</p>
            {driverPos && (
              <p className="mt-1 text-sm font-medium text-aparu-dark flex items-center gap-1">
                <FaLocationDot /> {distanceLabel(driverPos, activeRide, t)}
              </p>
            )}
          </div>

          {currentNextAction ? (
            <Button
              className="w-full sm:w-auto"
              disabled={actionMutation.isPending}
              onClick={() => actionMutation.mutate({ rideId: activeRide.id, action: currentNextAction.action })}
            >
              {actionMutation.isPending ? t('driver.savingBtn', 'Сохранение...') : currentNextAction.label}
            </Button>
          ) : (
            <p className="text-sm text-graphite-500">{t('driver.noActions', 'Нет доступных действий для этой поездки.')}</p>
          )}
        </Card>
      )}

      <Card className="p-6">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-graphite-900">{t('driver.availableOrdersTitle', 'Доступные заказы')}</h2>
          <Button
            variant="ghost"
            disabled={availableQ.isFetching}
            onClick={() => void availableQ.refetch()}
          >
            {t('driver.refreshBtn', 'Обновить')}
          </Button>
        </div>

        {availableQ.isPending && <p className="mt-4 text-sm text-graphite-500">{t('driver.loadingOrders', 'Загрузка заказов...')}</p>}
        {availableQ.isError && <p className="mt-4 text-sm text-red-600">{(availableQ.error as Error).message}</p>}

        {!availableQ.isPending && !availableQ.isError && availableRides.length === 0 && !activeRide && (
          <p className="mt-4 text-sm text-graphite-500">{t('driver.noPendingOrders', 'Нет ожидающих заказов в данный момент.')}</p>
        )}

        {!availableQ.isPending && !availableQ.isError && availableRides.length > 0 && (
          <div className="mt-4 grid gap-3">
            {availableRides.map((ride) => {
              const dist = distanceLabel(driverPos, ride, t)
              return (
                <Card key={ride.id} className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-medium text-graphite-900">{t('driver.orderId', 'Заказ #{{id}}', { id: ride.id })}</p>
                    <p className="mt-1 text-sm text-graphite-500">{coordsLabel(ride)}</p>
                    {dist && (
                      <p className="mt-1 text-sm font-medium text-aparu-dark flex items-center gap-1"><FaLocationDot /> {dist}</p>
                    )}
                  </div>
                  <Button
                    className="w-full sm:w-auto"
                    disabled={actionMutation.isPending || Boolean(activeRide)}
                    onClick={() => actionMutation.mutate({ rideId: ride.id, action: 'accept' })}
                  >
                    {actionMutation.isPending ? t('driver.savingBtn', 'Сохранение...') : t('driver.acceptOrderBtn', 'Принять заказ')}
                  </Button>
                </Card>
              )
            })}
          </div>
        )}
      </Card>
    </div>
  )
}
