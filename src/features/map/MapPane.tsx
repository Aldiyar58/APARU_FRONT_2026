import { useMemo } from 'react'
import { MapContainer, Marker, Polyline, TileLayer } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { aparuToLeaflet } from '../../utils/coordinates'
import { useRideStore } from '../../store/rideStore'
import { destinationIcon, pickupIcon } from './mapIcons'
import { MapViewSync } from './MapViewSync'
import { MapClickPick } from './MapClickPick'

const defaultCenter: [number, number] = [48.0, 66.9]
const defaultZoom = 5

export function MapPane() {
  const pickup = useRideStore((s) => s.pickup)
  const destination = useRideStore((s) => s.destination)
  const route = useRideStore((s) => s.route)

  const line = useMemo(() => {
    const coords = route?.Coordinates
    if (!coords?.length) return null
    return aparuToLeaflet(coords)
  }, [route])

  const center: [number, number] = pickup
    ? [pickup.lat, pickup.lng]
    : defaultCenter
  const zoom = pickup ? 15 : defaultZoom

  return (
    <div className="relative min-h-0 w-full flex-1 overflow-hidden md:h-full md:rounded-2xl md:ring-1 md:ring-graphite-200">
      <MapContainer
        center={center}
        zoom={zoom}
        className="h-full w-full"
        zoomControl={false}
        attributionControl={false}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          subdomains="abcd"
        />
        {pickup && (
          <Marker position={[pickup.lat, pickup.lng]} icon={pickupIcon} />
        )}
        {destination && (
          <Marker position={[destination.lat, destination.lng]} icon={destinationIcon} />
        )}
        {line && line.length > 1 && (
          <Polyline
            positions={line}
            pathOptions={{
              color: '#f97316',
              weight: 5,
              opacity: 0.92,
              lineCap: 'round',
              lineJoin: 'round',
            }}
          />
        )}
        <MapViewSync />
        <MapClickPick />
      </MapContainer>
      <div className="pointer-events-none absolute bottom-[max(0.75rem,env(safe-area-inset-bottom))] left-3 max-w-[calc(100%-6rem)] rounded-lg bg-white/85 px-2 py-1 text-[10px] leading-tight text-graphite-500 shadow-sm ring-1 ring-graphite-100 backdrop-blur md:bottom-3">
        © CARTO · OpenStreetMap
      </div>
    </div>
  )
}
