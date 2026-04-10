import { useQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import type { GeocodeResultItem } from '../../services/aparuApi'
import { geocode } from '../../services/aparuApi'
import { useDebouncedValue } from '../../hooks/useDebouncedValue'
import { useRideStore } from '../../store/rideStore'
import { formatGeocodeHitLabel } from '../../utils/format'
import { Input } from '../../components/ui/Input'
import { Skeleton } from '../../components/ui/Skeleton'
import { cn } from '../../utils/cn'

export function DestinationSearch() {
  const pickup = useRideStore((s) => s.pickup)
  const destinationLabel = useRideStore((s) => s.destinationLabel)
  const setDestination = useRideStore((s) => s.setDestination)
  const mapPick = useRideStore((s) => s.mapPickDestination)
  const setMapPick = useRideStore((s) => s.setMapPickDestination)
  const rideLifecycle = useRideStore((s) => s.rideLifecycle)

  const [q, setQ] = useState(destinationLabel)
  const [open, setOpen] = useState(false)
  const debounced = useDebouncedValue(q, 320)

  useEffect(() => {
    setQ(destinationLabel)
  }, [destinationLabel])

  const geocodeQuery = useQuery({
    queryKey: ['geocode', debounced, pickup?.lat, pickup?.lng],
    queryFn: () => geocode(debounced.trim(), pickup!.lat, pickup!.lng),
    enabled:
      open &&
      debounced.trim().length >= 2 &&
      !!pickup &&
      rideLifecycle === 'idle',
  })

  const hits = geocodeQuery.data?.Results ?? []

  function selectHit(hit: GeocodeResultItem) {
    if (!pickup) return
    const lat = hit.Locality?.Latitude
    const lng = hit.Locality?.Longitude
    if (lat == null || lng == null) return
    const label = formatGeocodeHitLabel(hit)
    setDestination({ lat, lng }, label)
    setQ(label)
    setOpen(false)
  }

  const blocked = rideLifecycle !== 'idle'

  return (
    <div className="relative">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-stretch">
        <div className="relative min-w-0 flex-1">
          <Input
            value={q}
            disabled={blocked || !pickup}
            placeholder="Куда едем?"
            aria-autocomplete="list"
            aria-expanded={open}
            onFocus={() => setOpen(true)}
            onChange={(e) => {
              setQ(e.target.value)
              setOpen(true)
            }}
            onBlur={() => {
              window.setTimeout(() => setOpen(false), 160)
            }}
          />
          {open && debounced.trim().length >= 2 && rideLifecycle === 'idle' && (
            <div
              className="absolute left-0 right-0 top-[calc(100%+6px)] z-50 max-h-[min(40vh,280px)] overflow-auto rounded-xl border border-graphite-100 bg-white py-1 shadow-[var(--shadow-float)] ring-1 ring-black/5 sm:max-h-56"
              role="listbox"
            >
              {geocodeQuery.isFetching && (
                <div className="space-y-2 p-3">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 max-w-[85%]" />
                  <Skeleton className="h-4 max-w-[65%]" />
                </div>
              )}
              {geocodeQuery.isError && (
                <p className="px-4 py-3 text-sm text-red-600">
                  {(geocodeQuery.error as Error).message}
                </p>
              )}
              {!geocodeQuery.isFetching &&
                !geocodeQuery.isError &&
                hits.length === 0 && (
                  <p className="px-4 py-3 text-sm text-graphite-500">
                    Нет совпадений. Уточните запрос или выберите точку на карте.
                  </p>
                )}
              {hits.map((hit, i) => (
                <button
                  key={`${hit.PlaceName ?? ''}-${i}`}
                  type="button"
                  role="option"
                  className="flex min-h-12 w-full flex-col items-start justify-center gap-0.5 px-4 py-2.5 text-left text-sm transition active:bg-graphite-100 sm:min-h-0 sm:py-3 sm:hover:bg-graphite-50"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => selectHit(hit)}
                >
                  <span className="font-medium text-graphite-900">
                    {formatGeocodeHitLabel(hit)}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
        <button
          type="button"
          disabled={blocked || !pickup}
          onClick={() => setMapPick(!mapPick)}
          className={cn(
            'min-h-12 shrink-0 rounded-xl border px-4 text-sm font-semibold transition sm:min-h-0 sm:self-auto sm:py-3',
            mapPick
              ? 'border-aparu bg-aparu/10 text-aparu-dark'
              : 'border-graphite-200 bg-white text-graphite-700 active:bg-graphite-50 sm:hover:border-graphite-300',
          )}
        >
          На карте
        </button>
      </div>
      {mapPick && (
        <p className="mt-2 text-xs text-aparu-dark">
          Нажмите на карте, чтобы указать точку назначения
        </p>
      )}
    </div>
  )
}
