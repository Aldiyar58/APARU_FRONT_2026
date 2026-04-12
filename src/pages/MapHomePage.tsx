import { useMutation, useQuery } from '@tanstack/react-query'
import { useEffect, useRef } from 'react'
import { AppHeader } from '../components/layout/AppHeader'
import { BonusScreen } from '../features/bonus/BonusScreen'
import { MapPane } from '../features/map/MapPane'
import { CompletedOverlay } from '../features/ride/CompletedOverlay'
import { ConfirmRideModal } from '../features/ride/ConfirmRideModal'
import { HomeBottomSheet } from '../features/ride/HomeBottomSheet'
import { QrEntryGate } from '../features/ride/QrEntryGate'
import { RidePhaseTimers } from '../features/ride/RidePhaseTimers'
import { RideStatusPanel } from '../features/ride/RideStatusPanel'
import { RouteSync } from '../features/ride/RouteSync'
import { useQrSearchParams } from '../hooks/useQrSearchParams'
import { fetchBonusSummary } from '../services/backend/bonusApi'
import { fetchQrPoint } from '../services/backend/entryApi'
import { cancelRide, getRide } from '../services/backend/rideApi'
import { fetchMe } from '../services/backend/userApi'
import { useAuthStore } from '../store/authStore'
import { useRideStore } from '../store/rideStore'
import { useUiStore } from '../store/uiStore'
import { useTranslation } from 'react-i18next'
import { useLocation } from 'react-router-dom'

export function MapHomePage() {
  const { t } = useTranslation()
  const { search } = useLocation()
  const { pointId } = useQrSearchParams(search)

  const setQrContext = useRideStore((s) => s.setQrContext)
  const setPickupAddress = useRideStore((s) => s.setPickupAddress)
  const applyRide = useRideStore((s) => s.applyRide)
  const resetRideSession = useRideStore((s) => s.resetRideSession)
  const rideId = useRideStore((s) => s.rideId)
  const rideLifecycle = useRideStore((s) => s.rideLifecycle)

  const accessToken = useAuthStore((s) => s.accessToken)
  const setBonusBalance = useAuthStore((s) => s.setBonusBalance)

  const bonusScreenOpen = useUiStore((s) => s.bonusScreenOpen)
  const setBonusScreenOpen = useUiStore((s) => s.setBonusScreenOpen)
  const pushToast = useUiStore((s) => s.pushToast)

  const lastHandledEntry = useRef<string | null>(null)
  const lastCompletedRide = useRef<number | null>(null)

  const validEntry = (pointId?.trim().length ?? 0) > 0

  const cancelMutation = useMutation({
    mutationFn: (id: number) => cancelRide(id),
    onSuccess: () => {
      pushToast(t('map.toastRideCancelled', 'Ride cancelled.'), 'info')
      resetRideSession()
    },
    onError: () => {
      pushToast(t('map.toastCancelFailed', 'Failed to cancel ride.'), 'error')
    },
  })

  const entryQ = useQuery({
    queryKey: ['qr-point', pointId],
    queryFn: () => fetchQrPoint(pointId!),
    enabled: validEntry,
  })

  const meQ = useQuery({
    queryKey: ['me', accessToken],
    queryFn: fetchMe,
    enabled: Boolean(accessToken),
  })

  const rideQ = useQuery({
    queryKey: ['ride', rideId, accessToken],
    queryFn: () => getRide(rideId!),
    enabled: Boolean(accessToken && rideId != null && rideLifecycle !== 'completed'),
    refetchInterval: 3_000,
  })

  useEffect(() => {
    if (!entryQ.isSuccess || !entryQ.data || !pointId) return
    const stamp = `${pointId}:${entryQ.dataUpdatedAt}`
    if (lastHandledEntry.current === stamp) return
    lastHandledEntry.current = stamp

    setQrContext(pointId, { lat: entryQ.data.lat, lng: entryQ.data.lng })

    if (entryQ.data.name) {
      setPickupAddress(entryQ.data.name)
    }

    if (accessToken) {
      pushToast(t('map.toastQrRetrieved', 'QR point retrieved.'), 'success')
    } else {
      pushToast(t('map.toastQrRetrievedSignin', 'QR point retrieved. Sign in to order.'), 'info')
    }
  }, [
    entryQ.isSuccess,
    entryQ.data,
    entryQ.dataUpdatedAt,
    pointId,
    accessToken,
    setPickupAddress,
    setQrContext,
    pushToast,
  ])

  useEffect(() => {
    if (!meQ.data) return

    setBonusBalance(meQ.data.profile.bonus_balance)

    if (rideId == null || rideLifecycle === 'idle') {
      const activeRide = meQ.data.rides.find((ride) => ride.status !== 'completed')
      if (activeRide) {
        applyRide(activeRide)
      }
    }
  }, [meQ.data, setBonusBalance, rideId, rideLifecycle, applyRide])

  useEffect(() => {
    if (rideQ.data) {
      applyRide(rideQ.data)
    }
  }, [rideQ.data, applyRide])

  useEffect(() => {
    if (!rideQ.data || rideQ.data.status !== 'completed') return
    if (lastCompletedRide.current === rideQ.data.id) return
    lastCompletedRide.current = rideQ.data.id

    pushToast(t('map.toastRideCompleted', 'Ride #{{id}} completed.', { id: rideQ.data.id }), 'success')

    if (!accessToken) return

    void fetchBonusSummary()
      .then((summary) => setBonusBalance(summary.balance))
      .catch(() => undefined)
  }, [rideQ.data, accessToken, setBonusBalance, pushToast])

  if (!validEntry && rideLifecycle === 'idle') {
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
            reverseLoading={entryQ.isPending}
            reverseError={(entryQ.error as Error | null) ?? null}
            reverseData={undefined}
            entryAddress={entryQ.data?.name}
          />
        )}
        {rideLifecycle !== 'idle' && rideLifecycle !== 'completed' && (
          <RideStatusPanel
            onCancel={() => rideId && cancelMutation.mutate(rideId)}
            isCanceling={cancelMutation.isPending}
          />
        )}
        <ConfirmRideModal />
        <CompletedOverlay />
      </main>
      <BonusScreen open={bonusScreenOpen} onClose={() => setBonusScreenOpen(false)} />
    </div>
  )
}
