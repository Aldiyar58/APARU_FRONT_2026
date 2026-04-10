import type { AparuCoordPair } from '../services/aparuApi'

/** Aparu / GeoJSON-style: [lng, lat] → Leaflet [lat, lng] */
export function aparuToLeaflet(coords: AparuCoordPair[]): [number, number][] {
  return coords.map(([lng, lat]) => [lat, lng])
}

export function leafletToAparu(lat: number, lng: number): AparuCoordPair {
  return [lng, lat]
}
