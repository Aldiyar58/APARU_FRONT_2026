import L from 'leaflet'

const pin = (hex: string, ring: string, label: string) =>
  L.divIcon({
    className: 'aparu-leaflet-pin',
    html: `<div style="width:28px;height:28px;border-radius:9999px;background:${hex};border:3px solid ${ring};box-shadow:0 4px 14px rgba(0,0,0,0.18);display:flex;align-items:center;justify-content:center;color:#fff;font-weight:800;font-size:13px;font-family:sans-serif">${label}</div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  })

export const pickupIcon = pin('#f97316', '#ffffff', 'A')
export const destinationIcon = pin('#2d2f36', '#ffffff', 'B')
