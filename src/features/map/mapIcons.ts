import L from 'leaflet'

const pin = (hex: string, ring: string) =>
  L.divIcon({
    className: 'aparu-leaflet-pin',
    html: `<div style="width:18px;height:18px;border-radius:9999px;background:${hex};border:3px solid ${ring};box-shadow:0 4px 14px rgba(0,0,0,0.18)"></div>`,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
  })

export const pickupIcon = pin('#f97316', '#ffffff')
export const destinationIcon = pin('#2d2f36', '#ffffff')
