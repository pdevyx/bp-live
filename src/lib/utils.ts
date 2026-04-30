import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { fromUnixTime, format } from "date-fns"
import type { components } from "./api/v1"
import type { OptionalVehicle, TripDetailsResponse } from "./types"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function formatTime(time: number | undefined) {
    return time ? format(fromUnixTime(time), "HH:mm") : undefined
}

export function vehicleFromTripResponse(
    resp: TripDetailsResponse
): OptionalVehicle {
    const vehicle = resp.entry.vehicle

    const headsign = vehicle?.label

    const tripId = resp.entry.tripId

    const trip: components["schemas"]["TransitTrip"] | undefined = tripId
        ? resp.references?.trips?.find((t) => t.id === tripId)
        : undefined

    const routeId = trip?.routeId

    const route: components["schemas"]["TransitRoute"] | undefined = routeId
        ? resp.references?.routes?.find((r) => r.id === routeId)
        : undefined

    return {
        headsign,
        tripId,
        routeId,
        vehicle,
        route,
        trip,
    }
}
