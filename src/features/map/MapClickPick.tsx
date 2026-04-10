import { useEffect } from 'react'
import { useMap, useMapEvents } from 'react-leaflet'
import { useRideStore } from '../../store/rideStore'

export function MapClickPick() {
  const map = useMap()
  const active = useRideStore((s) => s.mapPickDestination)
  const setDestination = useRideStore((s) => s.setDestination)
  const setMapPick = useRideStore((s) => s.setMapPickDestination)

  useMapEvents({
    click(e) {
      if (!active) return
      const { lat, lng } = e.latlng
      setDestination({ lat, lng }, 'Точка на карте')
      setMapPick(false)
      map.getContainer().style.cursor = ''
    },
  })

  useEffect(() => {
    const el = map.getContainer()
    if (active) {
      el.style.cursor = 'crosshair'
    } else {
      el.style.cursor = ''
    }
  }, [active, map])

  return null
}
