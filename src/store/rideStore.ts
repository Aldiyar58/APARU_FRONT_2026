import { create } from 'zustand'
import type { RouteResponse } from '../services/aparuApi'

export type RideLifecycle =
  | 'idle'
  | 'searching'
  | 'assigned'
  | 'arrived'
  | 'in_progress'
  | 'completed'

export type LatLng = { lat: number; lng: number }

type RideState = {
  qrPointId: string | null
  pickup: LatLng | null
  pickupAddress: string
  destination: LatLng | null
  destinationLabel: string
  route: RouteResponse | null
  routeFetchId: number
  /** Открыта ли нижняя панель подтверждения */
  confirmOpen: boolean
  /** Режим: следующий тап по карте задаёт точку B */
  mapPickDestination: boolean
  rideId: string | null
  rideLifecycle: RideLifecycle
  mockDriverName: string

  setQrContext: (pointId: string | null, pickup: LatLng) => void
  setPickupAddress: (address: string) => void
  setDestination: (ll: LatLng, label: string) => void
  clearDestinationAndRoute: () => void
  setRoute: (route: RouteResponse | null) => void
  bumpRouteFetch: () => void
  setConfirmOpen: (open: boolean) => void
  setMapPickDestination: (v: boolean) => void
  startMockRide: () => void
  advanceRideLifecycle: (next: RideLifecycle) => void
  resetRideSession: () => void
}

const drivers = ['Асхат · Toyota Camry', 'Данияр · Kia K5', 'Ерлан · Hyundai Sonata']

export const useRideStore = create<RideState>((set, get) => ({
  qrPointId: null,
  pickup: null,
  pickupAddress: '',
  destination: null,
  destinationLabel: '',
  route: null,
  routeFetchId: 0,
  confirmOpen: false,
  mapPickDestination: false,
  rideId: null,
  rideLifecycle: 'idle',
  mockDriverName: drivers[0],

  setQrContext: (pointId, pickup) =>
    set({
      qrPointId: pointId,
      pickup,
      pickupAddress: '',
      destination: null,
      destinationLabel: '',
      route: null,
      confirmOpen: false,
      mapPickDestination: false,
      rideId: null,
      rideLifecycle: 'idle',
      mockDriverName: drivers[Math.floor(Math.random() * drivers.length)],
    }),

  setPickupAddress: (pickupAddress) => set({ pickupAddress }),

  setDestination: (ll, label) =>
    set({
      destination: ll,
      destinationLabel: label,
      route: null,
      mapPickDestination: false,
    }),

  clearDestinationAndRoute: () =>
    set({ destination: null, destinationLabel: '', route: null, confirmOpen: false }),

  setRoute: (route) => set({ route }),

  bumpRouteFetch: () => set({ routeFetchId: get().routeFetchId + 1 }),

  setConfirmOpen: (confirmOpen) => set({ confirmOpen }),

  setMapPickDestination: (mapPickDestination) => set({ mapPickDestination }),

  startMockRide: () =>
    set({
      rideId: crypto.randomUUID(),
      rideLifecycle: 'searching',
      confirmOpen: false,
    }),

  advanceRideLifecycle: (rideLifecycle) => set({ rideLifecycle }),

  resetRideSession: () =>
    set({
      destination: null,
      destinationLabel: '',
      route: null,
      confirmOpen: false,
      mapPickDestination: false,
      rideId: null,
      rideLifecycle: 'idle',
      mockDriverName: drivers[Math.floor(Math.random() * drivers.length)],
    }),
}))
