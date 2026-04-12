import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { MapContainer, Marker, TileLayer, Tooltip, useMap, useMapEvents } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import type { BackendQrPoint } from '../../services/backend/adminApi'
import { cn } from '../../utils/cn'
import { destinationIcon, pickupIcon } from './mapIcons'

type SelectedPoint = {
  lat: number
  lng: number
} | null

type AdminQrMapPickerProps = {
  className?: string
  points?: BackendQrPoint[]
  selected: SelectedPoint
  onSelect: (point: { lat: number; lng: number }) => void
}

const defaultCenter: [number, number] = [48.0, 66.9]
const defaultZoom = 5
const selectedZoom = 15

function MapSelectionSync({ selected }: { selected: SelectedPoint }) {
  const map = useMap()

  useEffect(() => {
    if (selected) {
      map.setView([selected.lat, selected.lng], selectedZoom, { animate: true })
      return
    }

    map.setView(defaultCenter, defaultZoom, { animate: true })
  }, [map, selected])

  return null
}

function MapSelectionEvents({ onSelect }: { onSelect: (point: { lat: number; lng: number }) => void }) {
  const map = useMap()

  useMapEvents({
    click(event) {
      onSelect({
        lat: event.latlng.lat,
        lng: event.latlng.lng,
      })
    },
  })

  useEffect(() => {
    const container = map.getContainer()
    container.style.cursor = 'crosshair'

    return () => {
      container.style.cursor = ''
    }
  }, [map])

  return null
}

export function AdminQrMapPicker({ className, points = [], selected, onSelect }: AdminQrMapPickerProps) {
  const { t } = useTranslation()
  const center: [number, number] = selected ? [selected.lat, selected.lng] : defaultCenter
  const zoom = selected ? selectedZoom : defaultZoom

  return (
    <div className={cn('overflow-hidden rounded-2xl ring-1 ring-graphite-200', className)}>
      <MapContainer
        center={center}
        zoom={zoom}
        className="h-[320px] w-full md:h-[360px]"
        zoomControl={false}
        attributionControl={false}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          subdomains="abcd"
        />

        {points.map((point) => (
          <Marker key={point.id} position={[point.lat, point.lng]} icon={destinationIcon}>
            <Tooltip direction="top" offset={[0, -8]}>
              {point.name}
            </Tooltip>
          </Marker>
        ))}

        {selected && <Marker position={[selected.lat, selected.lng]} icon={pickupIcon} zIndexOffset={1000} />}

        <MapSelectionSync selected={selected} />
        <MapSelectionEvents onSelect={onSelect} />
      </MapContainer>

      <div className="border-t border-graphite-100 bg-white px-4 py-3 text-sm text-graphite-500">
        {t('admin.mapClickHint', 'Click anywhere on the map to fill in latitude and longitude.')}
      </div>
    </div>
  )
}
