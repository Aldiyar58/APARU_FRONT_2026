import { useState } from 'react'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { createRide } from '../../services/backend/rideApi'
import { useAuthStore } from '../../store/authStore'
import { useRideStore } from '../../store/rideStore'
import { useUiStore } from '../../store/uiStore'
import { formatDistanceMeters, formatDurationMs } from '../../utils/format'
import { cn } from '../../utils/cn'

export function ConfirmRideModal() {
  const open = useRideStore((s) => s.confirmOpen)
  const setConfirmOpen = useRideStore((s) => s.setConfirmOpen)
  const pickup = useRideStore((s) => s.pickup)
  const pickupAddress = useRideStore((s) => s.pickupAddress)
  const destination = useRideStore((s) => s.destination)
  const destinationLabel = useRideStore((s) => s.destinationLabel)
  const route = useRideStore((s) => s.route)
  const applyRide = useRideStore((s) => s.applyRide)
  const setRoute = useRideStore((s) => s.setRoute)
  const accessToken = useAuthStore((s) => s.accessToken)
  const pushToast = useUiStore((s) => s.pushToast)
  const [submitting, setSubmitting] = useState(false)

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[1500] flex items-end justify-center bg-graphite-900/45 backdrop-blur-[2px] sm:items-center sm:bg-graphite-900/40 sm:p-4 sm:backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-title"
    >
      <Card
        className={cn(
          'w-full max-h-[min(92dvh,640px)] max-w-md animate-[fadeUp_0.28s_ease-out] overflow-hidden p-0 shadow-[var(--shadow-float)]',
          'rounded-t-[1.35rem] rounded-b-none ring-0 sm:rounded-xl sm:p-6 sm:ring-1 sm:ring-graphite-100/80',
        )}
      >
        <div className="flex max-h-[min(92dvh,640px)] flex-col sm:max-h-none">
          <div className="flex shrink-0 justify-center pb-1 pt-2.5 sm:hidden" aria-hidden>
            <span className="h-1 w-11 rounded-full bg-graphite-200" />
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain px-4 pb-2 pt-2 [-webkit-overflow-scrolling:touch] sm:overflow-visible sm:p-0 sm:pt-0">
            <h2 id="confirm-title" className="text-lg font-semibold tracking-tight text-graphite-900 sm:text-xl">
              Confirm ride
            </h2>
            <p className="mt-2 text-sm text-graphite-500">
              This creates a real backend ride and keeps the rider screen synced with live ride status.
            </p>
            <ul className="mt-5 space-y-3 text-sm">
              <li className="flex gap-2">
                <span className="shrink-0 font-medium text-graphite-400">A</span>
                <span className="min-w-0 break-words text-graphite-800">{pickupAddress || 'Pickup point'}</span>
              </li>
              <li className="flex gap-2">
                <span className="shrink-0 font-medium text-graphite-400">B</span>
                <span className="min-w-0 break-words text-graphite-800">{destinationLabel || 'Destination'}</span>
              </li>
              <li className="flex flex-wrap gap-2 pt-1 text-graphite-600">
                <span className="font-semibold text-graphite-900">{formatDistanceMeters(route?.Distance)}</span>
                <span className="text-graphite-300">·</span>
                <span>{formatDurationMs(route?.Time)}</span>
              </li>
            </ul>
          </div>
          <div className="shrink-0 space-y-2 border-t border-graphite-100 bg-white px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4 sm:border-0 sm:bg-transparent sm:p-0 sm:pb-0 sm:pt-6">
            <div className="flex flex-col gap-2 sm:flex-row-reverse">
              <Button
                className="min-h-12 w-full sm:min-h-0 sm:flex-1"
                disabled={submitting}
                onClick={async () => {
                  if (!accessToken) {
                    pushToast('Sign in before creating a ride.', 'info')
                    return
                  }
                  if (!pickup || !destination) {
                    pushToast('Pick both ride points first.', 'error')
                    return
                  }

                  setSubmitting(true)
                  try {
                    const response = await createRide({
                      pointA: pickup,
                      pointB: destination,
                      tariff: 'economy',
                      paymentMethod: 'cash',
                    })
                    if (response.route) {
                      setRoute(response.route)
                    }
                    applyRide(response.ride)
                    pushToast(`Ride #${response.ride.id} created.`, 'success')
                  } catch (error) {
                    pushToast((error as Error).message, 'error')
                  } finally {
                    setSubmitting(false)
                  }
                }}
              >
                {submitting ? 'Creating...' : 'Confirm'}
              </Button>
              <Button
                variant="ghost"
                className="min-h-12 w-full sm:min-h-0 sm:flex-1"
                disabled={submitting}
                onClick={() => setConfirmOpen(false)}
              >
                Back
              </Button>
            </div>
          </div>
        </div>
      </Card>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
