import { useMemo } from 'react'

export type QrParams = {
  lat: number | null
  lng: number | null
  pointId: string | null
}

export function useQrSearchParams(search: string): QrParams {
  return useMemo(() => {
    const q = new URLSearchParams(search)
    const latRaw = q.get('lat')
    const lngRaw = q.get('lng')
    /** Backend uses `point_id`; legacy links may use `id`. */
    const pointRaw = q.get('point_id') ?? q.get('id')
    const lat = latRaw != null ? Number(latRaw) : NaN
    const lng = lngRaw != null ? Number(lngRaw) : NaN
    const valid = Number.isFinite(lat) && Number.isFinite(lng)
    return {
      lat: valid ? lat : null,
      lng: valid ? lng : null,
      pointId: pointRaw?.trim() || null,
    }
  }, [search])
}
