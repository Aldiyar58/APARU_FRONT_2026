import { useMutation, useQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import {
  acceptDriverRide,
  completeDriverRide,
  fetchAvailableDriverRides,
  markDriverRideArrived,
  startDriverRide,
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

function distanceLabel(driverPos: { lat: number; lng: number } | null, ride: BackendRide): string | null {
  if (!driverPos) return null
  const km = haversineKm(driverPos.lat, driverPos.lng, ride.point_a.lat, ride.point_a.lng)
  if (km < 1) return `${Math.round(km * 1000)} м от вас`
  return `${km.toFixed(1)} км от вас`
}

function nextAction(status: BackendRide['status']): {
  action: 'arrived' | 'start' | 'complete'
  label: string
} | null {
  if (status === 'assigned') return { action: 'arrived', label: 'Прибыл' }
  if (status === 'arrived') return { action: 'start', label: 'Начать поездку' }
  if (status === 'in_progress') return { action: 'complete', label: 'Завершить поездку' }
  return null
}

export function DriverActiveRidesPage() {
  const pushToast = useUiStore((s) => s.pushToast)
  const [activeRide, setActiveRide] = useState<BackendRide | null>(null)
  const [driverPos, setDriverPos] = useState<{ lat: number; lng: number } | null>(null)

  // ── GPS tracking ──
  useEffect(() => {
    if (!navigator.geolocation) return

    const watchId = navigator.geolocation.watchPosition(
      (pos) => setDriverPos({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => {
        /* ignore errors silently */
      },
      { enableHighAccuracy: true, maximumAge: 5_000 },
    )

    return () => navigator.geolocation.clearWatch(watchId)
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
        pushToast(`Поездка #${ride.id} завершена.`, 'success')
      } else {
        setActiveRide(ride)
        pushToast(`Поездка #${ride.id}: ${ride.status}.`, 'success')
      }
      await queryClient.invalidateQueries({ queryKey: ['driver-available-rides'] })
    },
    onError: (error) => {
      pushToast((error as Error).message, 'error')
    },
  })

  const availableRides = availableQ.data ?? []
  const currentNextAction = activeRide ? nextAction(activeRide.status) : null

  return (
    <div className="mx-auto max-w-4xl space-y-4 px-4 py-10">
      <Card className="p-6">
        <h1 className="text-2xl font-semibold text-graphite-900">Панель водителя</h1>
        <p className="mt-2 text-sm text-graphite-600">
          {driverPos
            ? `Ваше местоположение: ${driverPos.lat.toFixed(5)}, ${driverPos.lng.toFixed(5)}`
            : 'Определяем ваше местоположение…'}
        </p>
        <div className="mt-4 flex items-center gap-4">
          <Link className="text-sm font-semibold text-aparu-dark hover:underline" to="/">
            На карту
          </Link>
          <button
            type="button"
            className="text-sm font-semibold text-graphite-500 hover:text-graphite-800 hover:underline"
            onClick={() => {
              useAuthStore.getState().clearSession()
              pushToast('Вы вышли из системы', 'info')
            }}
          >
            Выйти
          </button>
        </div>
      </Card>

      {activeRide && (
        <Card className="space-y-4 p-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-graphite-400">Активная поездка</p>
            <h2 className="mt-2 text-xl font-semibold text-graphite-900">Поездка #{activeRide.id}</h2>
            <p className="mt-1 text-sm text-graphite-500">Статус: {activeRide.status}</p>
            <p className="mt-2 text-sm text-graphite-700">{coordsLabel(activeRide)}</p>
            {driverPos && (
              <p className="mt-1 text-sm font-medium text-aparu-dark">
                📍 {distanceLabel(driverPos, activeRide)}
              </p>
            )}
          </div>

          {currentNextAction ? (
            <Button
              className="w-full sm:w-auto"
              disabled={actionMutation.isPending}
              onClick={() => actionMutation.mutate({ rideId: activeRide.id, action: currentNextAction.action })}
            >
              {actionMutation.isPending ? 'Сохранение...' : currentNextAction.label}
            </Button>
          ) : (
            <p className="text-sm text-graphite-500">Нет доступных действий для этой поездки.</p>
          )}
        </Card>
      )}

      <Card className="p-6">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-graphite-900">Доступные заказы</h2>
          <Button
            variant="ghost"
            disabled={availableQ.isFetching}
            onClick={() => void availableQ.refetch()}
          >
            Обновить
          </Button>
        </div>

        {availableQ.isPending && <p className="mt-4 text-sm text-graphite-500">Загрузка заказов...</p>}
        {availableQ.isError && <p className="mt-4 text-sm text-red-600">{(availableQ.error as Error).message}</p>}

        {!availableQ.isPending && !availableQ.isError && availableRides.length === 0 && !activeRide && (
          <p className="mt-4 text-sm text-graphite-500">Нет ожидающих заказов в данный момент.</p>
        )}

        {!availableQ.isPending && !availableQ.isError && availableRides.length > 0 && (
          <div className="mt-4 grid gap-3">
            {availableRides.map((ride) => {
              const dist = distanceLabel(driverPos, ride)
              return (
                <Card key={ride.id} className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-medium text-graphite-900">Заказ #{ride.id}</p>
                    <p className="mt-1 text-sm text-graphite-500">{coordsLabel(ride)}</p>
                    {dist && (
                      <p className="mt-1 text-sm font-medium text-aparu-dark">📍 {dist}</p>
                    )}
                  </div>
                  <Button
                    className="w-full sm:w-auto"
                    disabled={actionMutation.isPending || Boolean(activeRide)}
                    onClick={() => actionMutation.mutate({ rideId: ride.id, action: 'accept' })}
                  >
                    {actionMutation.isPending ? 'Сохранение...' : 'Принять заказ'}
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
