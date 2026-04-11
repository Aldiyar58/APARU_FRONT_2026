import { useMutation, useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import {
  acceptDriverRide,
  completeDriverRide,
  fetchAvailableDriverRides,
  markDriverRideArrived,
  startDriverRide,
} from '../services/backend/driverApi'
import type { BackendRide } from '../services/backend/rideApi'
import { queryClient } from '../services/queryClient'
import { useUiStore } from '../store/uiStore'

function coordsLabel(ride: BackendRide): string {
  return `${ride.point_a.lat.toFixed(5)}, ${ride.point_a.lng.toFixed(5)} -> ${ride.point_b.lat.toFixed(5)}, ${ride.point_b.lng.toFixed(5)}`
}

function nextAction(status: BackendRide['status']): {
  action: 'arrived' | 'start' | 'complete'
  label: string
} | null {
  if (status === 'assigned') return { action: 'arrived', label: 'Mark arrived' }
  if (status === 'arrived') return { action: 'start', label: 'Start ride' }
  if (status === 'in_progress') return { action: 'complete', label: 'Complete ride' }
  return null
}

export function DriverActiveRidesPage() {
  const pushToast = useUiStore((s) => s.pushToast)
  const [activeRide, setActiveRide] = useState<BackendRide | null>(null)

  const availableQ = useQuery({
    queryKey: ['driver-available-rides'],
    queryFn: fetchAvailableDriverRides,
    refetchInterval: activeRide ? false : 5_000,
  })

  const actionMutation = useMutation({
    mutationFn: async (params: { rideId: number; action: 'accept' | 'arrived' | 'start' | 'complete' }) => {
      if (params.action === 'accept') return acceptDriverRide(params.rideId)
      if (params.action === 'arrived') return markDriverRideArrived(params.rideId)
      if (params.action === 'start') return startDriverRide(params.rideId)
      return completeDriverRide(params.rideId)
    },
    onSuccess: async (ride, params) => {
      if (params.action === 'complete') {
        setActiveRide(null)
        pushToast(`Ride #${ride.id} completed.`, 'success')
      } else {
        setActiveRide(ride)
        pushToast(`Ride #${ride.id}: ${ride.status}.`, 'success')
      }
      await queryClient.invalidateQueries({ queryKey: ['driver-available-rides'] })
    },
    onError: (error) => {
      pushToast((error as Error).message, 'error')
    },
  })

  const availableRides = availableQ.data ?? []
  const currentNextAction = activeRide ? nextAction(activeRide.status) : null

  return (
    <div className="mx-auto max-w-4xl space-y-4 px-4 py-10">
      <Card className="p-6">
        <h1 className="text-2xl font-semibold text-graphite-900">Driver rides</h1>
        <p className="mt-2 text-sm text-graphite-600">
          This screen is now wired to the backend driver endpoints for available rides and status updates.
        </p>
        <Link className="mt-4 inline-block text-sm font-semibold text-aparu-dark hover:underline" to="/">
          Back to map
        </Link>
      </Card>

      {activeRide && (
        <Card className="space-y-4 p-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-graphite-400">Active ride</p>
            <h2 className="mt-2 text-xl font-semibold text-graphite-900">Ride #{activeRide.id}</h2>
            <p className="mt-1 text-sm text-graphite-500">Status: {activeRide.status}</p>
            <p className="mt-2 text-sm text-graphite-700">{coordsLabel(activeRide)}</p>
          </div>

          {currentNextAction ? (
            <Button
              className="w-full sm:w-auto"
              disabled={actionMutation.isPending}
              onClick={() => actionMutation.mutate({ rideId: activeRide.id, action: currentNextAction.action })}
            >
              {actionMutation.isPending ? 'Saving...' : currentNextAction.label}
            </Button>
          ) : (
            <p className="text-sm text-graphite-500">No next backend action is available for this ride.</p>
          )}
        </Card>
      )}

      <Card className="p-6">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-graphite-900">Available rides</h2>
          <Button
            variant="ghost"
            disabled={availableQ.isFetching}
            onClick={() => void availableQ.refetch()}
          >
            Refresh
          </Button>
        </div>

        {availableQ.isPending && <p className="mt-4 text-sm text-graphite-500">Loading rides...</p>}
        {availableQ.isError && <p className="mt-4 text-sm text-red-600">{(availableQ.error as Error).message}</p>}

        {!availableQ.isPending && !availableQ.isError && availableRides.length === 0 && !activeRide && (
          <p className="mt-4 text-sm text-graphite-500">No searching rides are waiting right now.</p>
        )}

        {!availableQ.isPending && !availableQ.isError && availableRides.length > 0 && (
          <div className="mt-4 grid gap-3">
            {availableRides.map((ride) => (
              <Card key={ride.id} className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-medium text-graphite-900">Ride #{ride.id}</p>
                  <p className="mt-1 text-sm text-graphite-500">{coordsLabel(ride)}</p>
                </div>
                <Button
                  className="w-full sm:w-auto"
                  disabled={actionMutation.isPending || Boolean(activeRide)}
                  onClick={() => actionMutation.mutate({ rideId: ride.id, action: 'accept' })}
                >
                  {actionMutation.isPending ? 'Saving...' : 'Accept ride'}
                </Button>
              </Card>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
