/** Расстояние API в метрах */
export function formatDistanceMeters(meters: number | undefined): string {
  if (meters == null || Number.isNaN(meters)) return '—'
  if (meters < 1000) return `${Math.round(meters)} м`
  return `${(meters / 1000).toFixed(meters < 10000 ? 1 : 0)} км`
}

/** Aparu route: поле Time — миллисекунды (проверено на тестовом стенде). */
export function formatDurationMs(ms: number | undefined | null): string {
  if (ms == null || Number.isNaN(ms)) return '—'
  const sec = Math.max(1, Math.round(ms / 1000))
  if (sec < 60) return `~${sec} сек`
  const m = Math.floor(sec / 60)
  const s = sec % 60
  if (s === 0) return `~${m} мин`
  return `~${m} мин ${s} сек`
}

export function formatAddressFromReverse(r: {
  PlaceName?: string
  AreaName?: string
  Locality?: { Name?: string }
}): string {
  const main = r.PlaceName?.trim()
  const area = r.AreaName?.trim()
  const loc = r.Locality?.Name?.trim()
  if (main && area) return `${main}, ${area}`
  if (main) return main
  if (area) return area
  if (loc) return loc
  return 'Адрес уточняется'
}

export function formatGeocodeHitLabel(hit: {
  PlaceName?: string
  AreaName?: string
  Locality?: { Name?: string }
}): string {
  const main = hit.PlaceName?.trim()
  const area = hit.AreaName?.trim()
  const loc = hit.Locality?.Name?.trim()
  if (main && area) return `${main}, ${area}`
  if (main) return main
  if (area && loc) return `${area}, ${loc}`
  return area ?? loc ?? 'Точка на карте'
}
