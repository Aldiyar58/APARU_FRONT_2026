/** Aparu route coordinates: [lng, lat] */
export type AparuCoordPair = [number, number]

export interface RoutePoint {
  Longitude: number
  Latitude: number
}

export interface RouteInstruction {
  Distance?: number
  Time?: number
  Text?: string
  StreetName?: string
}

export interface RouteResponse {
  Distance?: number
  Time?: number
  Coordinates?: AparuCoordPair[]
  BBox?: [number, number, number, number]
  Instructions?: RouteInstruction[]
}

/** Legacy direct-Aparu geocode item shape (kept for gradual migration). */
export interface GeocodeResultItem {
  PlaceName?: string
  AreaName?: string
  Locality?: {
    Latitude?: number
    Longitude?: number
    Name?: string
  }
}

export interface ReverseGeocodeResponse {
  PlaceName?: string
  AreaName?: string
  AccuratePlace?: boolean
  Locality?: {
    LocalityId?: number
    Name?: string
    Latitude?: number
    Longitude?: number
  }
}
