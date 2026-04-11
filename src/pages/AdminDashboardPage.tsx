import { useMutation, useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import {
  fetchQrPoints,
  generateQrPoint,
  type QrGenerateResponse,
} from '../services/backend/adminApi'
import { queryClient } from '../services/queryClient'
import { useUiStore } from '../store/uiStore'

export function AdminDashboardPage() {
  const pushToast = useUiStore((s) => s.pushToast)
  const [name, setName] = useState('')
  const [lat, setLat] = useState('')
  const [lng, setLng] = useState('')
  const [generated, setGenerated] = useState<QrGenerateResponse | null>(null)

  const pointsQ = useQuery({
    queryKey: ['admin-qr-points'],
    queryFn: fetchQrPoints,
  })

  const generateMutation = useMutation({
    mutationFn: generateQrPoint,
    onSuccess: async (data) => {
      setGenerated(data)
      setName('')
      setLat('')
      setLng('')
      pushToast(`QR point #${data.qr_point.id} generated.`, 'success')
      await queryClient.invalidateQueries({ queryKey: ['admin-qr-points'] })
    },
    onError: (error) => {
      pushToast((error as Error).message, 'error')
    },
  })

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
          <p className="mt-1 text-sm text-graphite-500">Create a backend QR point and get the generated PNG immediately.</p>
        </div>

        <form
          className="grid gap-3 sm:grid-cols-3"
          onSubmit={(event) => {
            event.preventDefault()
            const latValue = Number(lat)
            const lngValue = Number(lng)

            if (!name.trim() || !Number.isFinite(latValue) || !Number.isFinite(lngValue)) {
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
          <div className="sm:col-span-3">
            <Button type="submit" disabled={generateMutation.isPending}>
              {generateMutation.isPending ? 'Generating...' : 'Generate QR'}
            </Button>
          </div>
        </form>
      </Card>

      {generated && (
        <Card className="space-y-4 p-6">
          <div>
            <h2 className="text-lg font-semibold text-graphite-900">Latest QR</h2>
            <p className="mt-1 text-sm text-graphite-500">{generated.url}</p>
          </div>
          <img
            src={`data:image/png;base64,${generated.qr_base64}`}
            alt={`QR for ${generated.qr_point.name}`}
            className="w-full max-w-xs rounded-xl border border-graphite-200 bg-white p-3"
          />
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
