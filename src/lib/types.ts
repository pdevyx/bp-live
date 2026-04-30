import type { components } from "./api/v1"

export type WithMobileReferences<T> = Omit<T, "references"> & {
    references?: components["schemas"]["MobileTransitReferences"]
}

export type TripDetailsResponse = WithMobileReferences<
    components["schemas"]["TransitEntryWithReferencesTransitTripDetailsOTP"]
>

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
    route: components["schemas"]["TransitRoute"] | undefined
    trip: components["schemas"]["TransitTrip"] | undefined
}

export type OptionalVehicle = Omit<Vehicle, "vehicle"> & {
    vehicle: Vehicle["vehicle"] | undefined
}

export type BoundingBox = {
    lat: number
    lon: number
    latSpan: number
    lonSpan: number
}
