import { Card } from '../../components/ui/Card'
import { useRideStore } from '../../store/rideStore'
import { cn } from '../../utils/cn'

const copy: Record<string, { title: string; subtitle: string }> = {
  searching: {
    title: 'Looking for a driver',
    subtitle: 'Usually takes 10 to 40 seconds',
  },
  assigned: {
    title: 'Driver assigned',
    subtitle: 'Heading to your pickup point',
  },
  arrived: {
    title: 'Driver arrived',
    subtitle: 'You can head out now',
  },
  in_progress: {
    title: 'On the way',
    subtitle: 'Ride is in progress',
  },
}

export function RideStatusPanel() {
  const rideLifecycle = useRideStore((s) => s.rideLifecycle)
  const driverLabel = useRideStore((s) => s.driverLabel)

  const statusCopy = copy[rideLifecycle]
  if (rideLifecycle === 'idle' || rideLifecycle === 'completed' || !statusCopy) {
    return null
  }

  const { title, subtitle } = statusCopy

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[600] flex justify-center md:p-4 md:pb-[max(1rem,env(safe-area-inset-bottom))]">
      <Card
        className={cn(
          'pointer-events-auto w-full max-w-lg overflow-hidden p-0',
          'rounded-t-[1.35rem] rounded-b-none shadow-[0_-10px_44px_-12px_rgba(0,0,0,0.14)] ring-0',
          'md:rounded-xl md:p-5 md:shadow-[var(--shadow-card)] md:ring-1 md:ring-graphite-100/80',
        )}
      >
        <div className="pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-1 md:pb-0 md:pt-0">
          <div className="flex justify-center pb-2 pt-1 md:hidden" aria-hidden>
            <span className="h-1 w-11 rounded-full bg-graphite-200" />
          </div>
          <div className="flex items-start gap-3 px-4 pb-4 pt-0 md:gap-4 md:p-0">
            <div className="relative mt-0.5 h-11 w-11 shrink-0 overflow-hidden rounded-xl bg-graphite-100 sm:h-12 sm:w-12">
              <div className="absolute inset-0 flex items-center justify-center text-base font-semibold text-graphite-500 sm:text-lg">
                AP
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-medium uppercase tracking-wider text-graphite-400 sm:text-xs">Status</p>
              <h3 className="text-base font-semibold text-graphite-900 sm:text-lg">{title}</h3>
              <p className="text-sm text-graphite-500">{subtitle}</p>
              {rideLifecycle !== 'searching' && (
                <p className="mt-2 truncate text-sm font-medium text-graphite-800">
                  {driverLabel ?? 'APARU driver assigned'}
                </p>
              )}
            </div>
            {rideLifecycle === 'searching' && (
              <span className="relative mt-2 flex h-3 w-3 shrink-0 self-start">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-aparu/40" />
                <span className="relative inline-flex h-3 w-3 rounded-full bg-aparu" />
              </span>
            )}
          </div>
        </div>
      </Card>
    </div>
  )
}
