import { create } from 'zustand'
import type { RouteResponse } from '../services/aparuApi'
import type { BackendRide, BackendRideStatus } from '../services/backend/rideApi'

export type RideLifecycle = 'idle' | BackendRideStatus

export type LatLng = { lat: number; lng: number }

export type Tariff = 'economy' | 'comfort'
export type PaymentMethod = 'cash' | 'kaspi' | 'halyq'

function driverLabelFor(driverId: number | null): string | null {
  if (driverId == null) return null
  return `Driver #${driverId}`
}

function pointLabel(point: LatLng): string {
  return `${point.lat.toFixed(5)}, ${point.lng.toFixed(5)}`
}

type RideState = {
  qrPointId: string | null
  pickup: LatLng | null
  pickupAddress: string
  destination: LatLng | null
  destinationLabel: string
  route: RouteResponse | null
  confirmOpen: boolean
  mapPickDestination: boolean
  rideId: number | null
  rideLifecycle: RideLifecycle
  driverLabel: string | null
  tariff: Tariff
  paymentMethod: PaymentMethod

  setQrContext: (pointId: string | null, pickup: LatLng) => void
  setPickupAddress: (address: string) => void
  setDestination: (ll: LatLng, label: string) => void
  clearDestinationAndRoute: () => void
  setRoute: (route: RouteResponse | null) => void
  setConfirmOpen: (open: boolean) => void
  setMapPickDestination: (v: boolean) => void
  setTariff: (tariff: Tariff) => void
  setPaymentMethod: (method: PaymentMethod) => void
  applyRide: (ride: BackendRide) => void
  resetRideSession: () => void
}

export const useRideStore = create<RideState>((set) => ({
  qrPointId: null,
  pickup: null,
  pickupAddress: '',
  destination: null,
  destinationLabel: '',
  route: null,
  confirmOpen: false,
  mapPickDestination: false,
  rideId: null,
  rideLifecycle: 'idle',
  driverLabel: null,
  tariff: 'economy',
  paymentMethod: 'cash',

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
      driverLabel: null,
      tariff: 'economy',
      paymentMethod: 'cash',
    }),

  setPickupAddress: (pickupAddress) => set({ pickupAddress }),

  setDestination: (destination, destinationLabel) =>
    set({
      destination,
      destinationLabel,
      route: null,
      mapPickDestination: false,
    }),

  clearDestinationAndRoute: () =>
    set({ destination: null, destinationLabel: '', route: null, confirmOpen: false }),

  setRoute: (route) => set({ route }),

  setConfirmOpen: (confirmOpen) => set({ confirmOpen }),

  setMapPickDestination: (mapPickDestination) => set({ mapPickDestination }),

  setTariff: (tariff) => set({ tariff }),

  setPaymentMethod: (paymentMethod) => set({ paymentMethod }),

  applyRide: (ride) =>
    set((state) => {
      const pickup = { lat: ride.point_a.lat, lng: ride.point_a.lng }
      const destination = { lat: ride.point_b.lat, lng: ride.point_b.lng }

      return {
        pickup,
        pickupAddress: state.pickupAddress || pointLabel(pickup),
        destination,
        destinationLabel: state.destinationLabel || pointLabel(destination),
        rideId: ride.id,
        rideLifecycle: ride.status,
        driverLabel: driverLabelFor(ride.driver_id),
        confirmOpen: false,
      }
    }),

  resetRideSession: () =>
    set({
      destination: null,
      destinationLabel: '',
      route: null,
      confirmOpen: false,
      mapPickDestination: false,
      rideId: null,
      rideLifecycle: 'idle',
      driverLabel: null,
      tariff: 'economy',
      paymentMethod: 'cash',
    }),
}))

