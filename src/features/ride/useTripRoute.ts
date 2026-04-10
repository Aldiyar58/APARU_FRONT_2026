import { useQuery } from '@tanstack/react-query'
import { fetchRoute } from '../../services/aparuApi'
import { useRideStore } from '../../store/rideStore'

export function useTripRoute() {
  const pickup = useRideStore((s) => s.pickup)
  const dest = useRideStore((s) => s.destination)
  const lifecycle = useRideStore((s) => s.rideLifecycle)

  return useQuery({
    queryKey: ['route', pickup?.lat, pickup?.lng, dest?.lat, dest?.lng] as const,
    queryFn: () =>
      fetchRoute([
        { Longitude: pickup!.lng, Latitude: pickup!.lat },
        { Longitude: dest!.lng, Latitude: dest!.lat },
      ]),
    enabled: Boolean(pickup && dest && lifecycle === 'idle'),
  })
}
