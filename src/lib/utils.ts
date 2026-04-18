import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { components } from "./api/v1"
import type { Vehicle } from "./types"
import { fromUnixTime, format } from "date-fns"


export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function formatTime(time: number | undefined) {
    return time ? format(fromUnixTime(time), "HH:mm") : undefined
}

export function vehicleFromTripResponse(
    resp: components["schemas"]["TransitEntryWithReferencesTransitTripDetailsOTP"]
) {
    const vehicle = resp.entry.vehicle

    const headsign = vehicle?.label

    const trip: components["schemas"]["TransitTrip"] =
        resp.references?.trips?.[resp.entry.tripId ?? ""]

    const route: components["schemas"]["TransitRoute"] =
        resp.references?.routes?.[trip.routeId ?? ""]

    const tripId = trip?.id
    const routeId = route?.id

    return {
        headsign,
        tripId,
        routeId,
        vehicle,
        route,
        trip,
    } satisfies Vehicle
}
