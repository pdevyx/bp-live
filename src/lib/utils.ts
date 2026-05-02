import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import {
    fromUnixTime,
    format,
    intlFormatDistance,
    formatDistance,
} from "date-fns"
import type { components } from "./api/v1"
import type { OptionalVehicle, TripDetailsResponse } from "./types"
import type { FormattedStopTimes } from "@/features/trips/stop-time-entry"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function formatTimeSeconds(time: number | undefined) {
    return time ? format(fromUnixTime(time), "HH:mm") : undefined
}

export function formatTimeMillis(time: number | undefined) {
    return time ? format(time, "HH:mm") : undefined
}

export function formatTimeUntil(time: number | undefined) {
    if (!time) return undefined

    const now = new Date().getTime() / 1000

    const diff = time - now

    if (diff < 15) {
        return "NOW"
    } else if (diff < 60) {
        return "1'"
    } else if (diff < 3600) {
        const minutes = Math.round(diff / 60)
        return `${minutes}'`
    } else {
        return formatTimeSeconds(time)
    }
}

export type StopTimeEntry = {
    arrivalTime?: number | undefined
    departureTime?: number | undefined
    predictedArrivalTime?: number | undefined
    predictedDepartureTime?: number | undefined
    stopSequence?: number | undefined
}

export function getFormattedStopTimes<T extends StopTimeEntry>(
    data: T
): FormattedStopTimes {
    const arrivalTime = data.arrivalTime
    const departureTime = data.departureTime
    const predictedArrivalTime = data.predictedArrivalTime
    const predictedDepartureTime = data.predictedDepartureTime

    return {
        arrivalTime:
            predictedArrivalTime !== undefined
                ? {
                      time: predictedArrivalTime,
                      isPredicted: true,
                  }
                : {
                      time: arrivalTime,
                      isPredicted: false,
                  },
        departureTime:
            predictedDepartureTime !== undefined
                ? {
                      time: predictedDepartureTime,
                      isPredicted: true,
                  }
                : {
                      time: departureTime,
                      isPredicted: false,
                  },
    } satisfies FormattedStopTimes
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
