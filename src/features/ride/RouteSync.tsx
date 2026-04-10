import { useEffect } from 'react'
import { useRideStore } from '../../store/rideStore'
import { useTripRoute } from './useTripRoute'

/** Синхронизирует react-query маршрут → Zustand для карты и UI */
export function RouteSync() {
  const pickup = useRideStore((s) => s.pickup)
  const dest = useRideStore((s) => s.destination)
  const lifecycle = useRideStore((s) => s.rideLifecycle)
  const setRoute = useRideStore((s) => s.setRoute)
  const q = useTripRoute()

  useEffect(() => {
    const active = Boolean(pickup && dest && lifecycle === 'idle')
    if (!active) return
    if (q.isSuccess && q.data) setRoute(q.data)
    if (q.isError) setRoute(null)
  }, [pickup, dest, lifecycle, q.isSuccess, q.isError, q.data, setRoute])

  return null
}
