import { useEffect } from 'react'
import type { RideLifecycle } from '../../store/rideStore'
import { useRideStore } from '../../store/rideStore'

const nextPhase: Partial<Record<RideLifecycle, RideLifecycle>> = {
  searching: 'assigned',
  assigned: 'arrived',
  arrived: 'in_progress',
  in_progress: 'completed',
}

const delayMs: Partial<Record<RideLifecycle, number>> = {
  searching: 3000,
  assigned: 2500,
  arrived: 2000,
  in_progress: 4000,
}

/** Симуляция этапов поездки через setTimeout */
export function RidePhaseTimers() {
  const rideLifecycle = useRideStore((s) => s.rideLifecycle)
  const advanceRideLifecycle = useRideStore((s) => s.advanceRideLifecycle)

  useEffect(() => {
    if (
      rideLifecycle === 'idle' ||
      rideLifecycle === 'completed' ||
      !nextPhase[rideLifecycle]
    ) {
      return
    }
    const ms = delayMs[rideLifecycle]
    if (ms == null) return
    const t = window.setTimeout(() => {
      const n = nextPhase[rideLifecycle]
      if (n) advanceRideLifecycle(n)
    }, ms)
    return () => window.clearTimeout(t)
  }, [rideLifecycle, advanceRideLifecycle])

  return null
}
