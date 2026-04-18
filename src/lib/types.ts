import type { components } from "./api/v1"

export type VehicleStyle = {
    icon: {
        color: string
        secondaryColor: string
        name: string
    }
    color: string
    textColor: string
}

export type VehicleStr = {
    headsign: string | undefined
    tripId: string | undefined
    routeId: string | undefined
    // style: VehicleStyle,
    vehicle: string
    route: string
    trip: string
}

export type Vehicle = {
    headsign: string | undefined
    tripId: string | undefined
    routeId: string | undefined
    // style: VehicleStyle,
    vehicle: components["schemas"]["TransitVehicle"]
    route: components["schemas"]["TransitRoute"]
    trip: components["schemas"]["TransitTrip"]
}

export type BoundingBox = {
    lat: number
    lon: number
    latSpan: number
    lonSpan: number
}
