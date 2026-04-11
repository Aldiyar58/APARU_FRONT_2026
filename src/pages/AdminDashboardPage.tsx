import { useMutation, useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { AdminQrMapPicker } from '../features/map/AdminQrMapPicker'
import {
  fetchQrPoints,
  generateQrPoint,
  type QrGenerateResponse,
} from '../services/backend/adminApi'
import { queryClient } from '../services/queryClient'
import { useUiStore } from '../store/uiStore'

function parseCoordinate(value: string) {
  const normalized = value.trim().replace(',', '.')
  if (!normalized) return null

  const parsed = Number(normalized)
  return Number.isFinite(parsed) ? parsed : null
}

function formatCoordinate(value: number) {
  return value.toFixed(6)
}

function buildQrFilename(generated: QrGenerateResponse) {
  const safeName = generated.qr_point.name
    .trim()
    .normalize('NFKC')
    .replace(/[<>:"/\\|?*]+/g, ' ')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')

  return `${safeName || `qr-point-${generated.qr_point.id}`}.png`
}

export function AdminDashboardPage() {
  const pushToast = useUiStore((s) => s.pushToast)
  const [name, setName] = useState('')
  const [lat, setLat] = useState('')
  const [lng, setLng] = useState('')
  const [generated, setGenerated] = useState<QrGenerateResponse | null>(null)
  const latValue = parseCoordinate(lat)
  const lngValue = parseCoordinate(lng)
  const selectedPoint = latValue != null && lngValue != null
    ? { lat: latValue, lng: lngValue }
    : null

  const pointsQ = useQuery({
    queryKey: ['admin-qr-points'],
    queryFn: fetchQrPoints,
  })

  const generateMutation = useMutation({
    mutationFn: generateQrPoint,
    onSuccess: async (data) => {
      setGenerated(data)
      setName('')
      pushToast(`QR point #${data.qr_point.id} generated.`, 'success')
      await queryClient.invalidateQueries({ queryKey: ['admin-qr-points'] })
    },
    onError: (error) => {
      pushToast((error as Error).message, 'error')
    },
  })

  function handleMapSelect(point: { lat: number; lng: number }) {
    setLat(formatCoordinate(point.lat))
    setLng(formatCoordinate(point.lng))
  }

  function handleDownloadQr() {
    if (!generated) return

    const link = document.createElement('a')
    link.href = `data:image/png;base64,${generated.qr_base64}`
    link.download = buildQrFilename(generated)
    document.body.append(link)
    link.click()
    link.remove()
  }

  return (
    <div className="mx-auto max-w-5xl space-y-4 px-4 py-10">
      <Card className="p-6">
        <h1 className="text-2xl font-semibold text-graphite-900">Admin dashboard</h1>
        <p className="mt-2 text-sm text-graphite-600">
          QR point generation and listing now use the real admin backend endpoints.
        </p>
        <Link className="mt-4 inline-block text-sm font-semibold text-aparu-dark hover:underline" to="/">
          Back to map
        </Link>
      </Card>

      <Card className="space-y-4 p-6">
        <div>
          <h2 className="text-lg font-semibold text-graphite-900">Generate QR point</h2>
          <p className="mt-1 text-sm text-graphite-500">
            Create a backend QR point and get the generated PNG immediately.
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-[minmax(0,340px)_minmax(0,1fr)]">
          <form
            className="grid content-start gap-3"
            onSubmit={(event) => {
              event.preventDefault()

              if (!name.trim() || latValue == null || lngValue == null) {
                pushToast('Enter a name, latitude, and longitude.', 'error')
                return
              }

              generateMutation.mutate({
                name: name.trim(),
                lat: latValue,
                lng: lngValue,
              })
            }}
          >
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Point name" />
            <Input value={lat} onChange={(e) => setLat(e.target.value)} placeholder="Latitude" inputMode="decimal" />
            <Input value={lng} onChange={(e) => setLng(e.target.value)} placeholder="Longitude" inputMode="decimal" />
            <p className="text-sm text-graphite-500">
              You can type coordinates manually or pick them directly on the map.
            </p>
            <div>
              <Button type="submit" disabled={generateMutation.isPending}>
                {generateMutation.isPending ? 'Generating...' : 'Generate QR'}
              </Button>
            </div>
          </form>

          <AdminQrMapPicker
            points={pointsQ.data}
            selected={selectedPoint}
            onSelect={handleMapSelect}
          />
        </div>
      </Card>

      {generated && (
        <Card className="space-y-4 p-6">
          <div>
            <h2 className="text-lg font-semibold text-graphite-900">Latest QR</h2>
            <p className="mt-1 text-sm text-graphite-500">{generated.url}</p>
          </div>
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <img
              src={`data:image/png;base64,${generated.qr_base64}`}
              alt={`QR for ${generated.qr_point.name}`}
              className="w-full max-w-xs rounded-xl border border-graphite-200 bg-white p-3"
            />
            <div className="flex flex-wrap gap-3">
              <Button onClick={handleDownloadQr}>Download PNG</Button>
              <a
                href={generated.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-12 min-w-12 items-center justify-center rounded-xl border border-graphite-200 px-5 py-3.5 text-[16px] font-semibold tracking-tight text-graphite-700 transition hover:bg-graphite-50 sm:min-h-0 sm:min-w-0 sm:text-[15px]"
              >
                Open QR link
              </a>
            </div>
          </div>
        </Card>
      )}

      <Card className="p-6">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-graphite-900">QR points</h2>
          <Button variant="ghost" disabled={pointsQ.isFetching} onClick={() => void pointsQ.refetch()}>
            Refresh
          </Button>
        </div>

        {pointsQ.isPending && <p className="mt-4 text-sm text-graphite-500">Loading QR points...</p>}
        {pointsQ.isError && <p className="mt-4 text-sm text-red-600">{(pointsQ.error as Error).message}</p>}

        {!pointsQ.isPending && !pointsQ.isError && (
          <div className="mt-4 grid gap-3">
            {(pointsQ.data ?? []).map((point) => (
              <Card key={point.id} className="space-y-1 p-4">
                <p className="font-medium text-graphite-900">{point.name}</p>
                <p className="text-sm text-graphite-500">{point.lat.toFixed(5)}, {point.lng.toFixed(5)}</p>
                <p className="text-xs text-graphite-400">Created {new Date(point.created_at).toLocaleString()}</p>
              </Card>
            ))}
            {(pointsQ.data ?? []).length === 0 && (
              <p className="text-sm text-graphite-500">No QR points have been created yet.</p>
            )}
          </div>
        )}
      </Card>
    </div>
  )
}
