import { useEffect, useMemo } from 'react'
import { useMap } from 'react-leaflet'
import { aparuToLeaflet } from '../../utils/coordinates'
import { useRideStore } from '../../store/rideStore'

export function MapViewSync() {
  const map = useMap()
  const pickup = useRideStore((s) => s.pickup)
  const destination = useRideStore((s) => s.destination)
  const route = useRideStore((s) => s.route)

  const line = useMemo(() => {
    const c = route?.Coordinates
    if (!c?.length) return null
    return aparuToLeaflet(c)
  }, [route])

  useEffect(() => {
    if (line && line.length > 1) {
      map.fitBounds(line, { padding: [56, 56], maxZoom: 16, animate: true })
      return
    }
    const pts: [number, number][] = []
    if (pickup) pts.push([pickup.lat, pickup.lng])
    if (destination) pts.push([destination.lat, destination.lng])
    if (pts.length === 2) {
      map.fitBounds(pts, { padding: [88, 88], maxZoom: 16, animate: true })
    } else if (pts.length === 1) {
      map.setView(pts[0], 15, { animate: true })
    }
  }, [map, pickup, destination, line])

  return null
}
