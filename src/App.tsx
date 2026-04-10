import { useQuery } from '@tanstack/react-query'
import { useEffect, useLayoutEffect } from 'react'
import { AppHeader } from './components/layout/AppHeader'
import { BonusScreen } from './features/bonus/BonusScreen'
import { MapPane } from './features/map/MapPane'
import { CompletedOverlay } from './features/ride/CompletedOverlay'
import { ConfirmRideModal } from './features/ride/ConfirmRideModal'
import { HomeBottomSheet } from './features/ride/HomeBottomSheet'
import { QrEntryGate } from './features/ride/QrEntryGate'
import { RidePhaseTimers } from './features/ride/RidePhaseTimers'
import { RideStatusPanel } from './features/ride/RideStatusPanel'
import { RouteSync } from './features/ride/RouteSync'
import { useLocationSearch } from './hooks/useLocationSearch'
import { useQrSearchParams } from './hooks/useQrSearchParams'
import { reverseGeocode } from './services/aparuApi'
import { useBonusStore } from './store/bonusStore'
import { useRideStore } from './store/rideStore'
import { useUiStore } from './store/uiStore'
import { formatAddressFromReverse } from './utils/format'

function AppShell() {
  const search = useLocationSearch()
  const { lat, lng, pointId } = useQrSearchParams(search)

  const setQrContext = useRideStore((s) => s.setQrContext)
  const setPickupAddress = useRideStore((s) => s.setPickupAddress)
  const pickup = useRideStore((s) => s.pickup)
  const rideLifecycle = useRideStore((s) => s.rideLifecycle)
  const claimScanBonus = useBonusStore((s) => s.claimScanBonus)

  const bonusScreenOpen = useUiStore((s) => s.bonusScreenOpen)
  const setBonusScreenOpen = useUiStore((s) => s.setBonusScreenOpen)

  useLayoutEffect(() => {
    if (lat != null && lng != null) {
      setQrContext(pointId, { lat, lng })
      claimScanBonus(pointId)
    }
  }, [lat, lng, pointId, setQrContext, claimScanBonus])

  const reverseQ = useQuery({
    queryKey: ['reverse', pickup?.lat, pickup?.lng],
    queryFn: () => reverseGeocode(pickup!.lat, pickup!.lng),
    enabled: pickup != null,
  })

  useEffect(() => {
    if (reverseQ.data) {
      setPickupAddress(formatAddressFromReverse(reverseQ.data))
    }
  }, [reverseQ.data, setPickupAddress])

  const validEntry = lat != null && lng != null

  if (!validEntry) {
    return <QrEntryGate />
  }

  return (
    <div className="mobile-app-root relative flex flex-col overflow-hidden bg-graphite-100 md:min-h-[100dvh] md:overflow-visible md:bg-graphite-50">
      <AppHeader />
      <main className="relative flex min-h-0 flex-1 flex-col md:min-h-0 md:p-4 md:pt-20">
        <MapPane />
        <RouteSync />
        <RidePhaseTimers />
        {rideLifecycle === 'idle' && (
          <HomeBottomSheet
            reverseLoading={reverseQ.isPending}
            reverseError={reverseQ.error as Error | null}
            reverseData={reverseQ.data}
          />
        )}
        {rideLifecycle !== 'idle' && rideLifecycle !== 'completed' && <RideStatusPanel />}
        <ConfirmRideModal />
        <CompletedOverlay />
      </main>
      <BonusScreen open={bonusScreenOpen} onClose={() => setBonusScreenOpen(false)} />
    </div>
  )
}

export default function App() {
  return <AppShell />
}
