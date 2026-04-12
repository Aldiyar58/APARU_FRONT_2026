import { useMemo } from 'react'

export type QrParams = {
  pointId: string | null
}

export function useQrSearchParams(search: string): QrParams {
  return useMemo(() => {
    const q = new URLSearchParams(search)
    /** Backend uses `point_id`; legacy links may use `id`. */
    const pointRaw = q.get('point_id') ?? q.get('id')
    return {
      pointId: pointRaw?.trim() || null,
    }
  }, [search])
}
