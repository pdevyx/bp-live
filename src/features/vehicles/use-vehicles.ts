import { useMemo } from "react"
import { useMapStore } from "@/store/map.store"
import { FUTAR_API_VERSION } from "@/lib/constants"
import type { Vehicle } from "@/lib/types"
import { keepPreviousData } from "@tanstack/react-query"
import { $api } from "@/lib/client"

export function useVehicles({ tripIds }: { tripIds?: string[] } = {}) {
    const bounds = useMapStore((state) => state.bounds)

    const vehiclesForLocation = $api.useQuery(
        "get",
        "/{dialect}/api/where/vehicles-for-location",
        {
            params: {
                path: { dialect: "otp" },
                query: {
                    appVersion: import.meta.env.VITE_APP_VERSION ?? "1.0.0",
                    version: FUTAR_API_VERSION,
                    key: import.meta.env.VITE_FUTAR_API_KEY,
                    ...bounds!,
                },
            },
        },
        {
            enabled: !!bounds,
            refetchInterval: 5000,
            placeholderData: keepPreviousData,
        }
    )

    const vehicleForTrip = $api.useQuery(
        "get",
        "/{dialect}/api/where/vehicle-for-trip",
        {
            params: {
                path: { dialect: "otp" },
                query: {
                    appVersion: import.meta.env.VITE_APP_VERSION ?? "1.0.0",
                    version: FUTAR_API_VERSION,
                    key: import.meta.env.VITE_FUTAR_API_KEY,
                    tripId: tripIds ?? [],
                    ...bounds!,
                },
            },
        },
        {
            enabled: !!bounds && !!tripIds && tripIds.length > 0,
            refetchInterval: 5000,
            placeholderData: keepPreviousData,
            staleTime: Infinity,
            gcTime: Infinity
        }
    )

    const vehicles = useMemo(() => {
        let data = undefined
        if (!!tripIds && tripIds.length > 0 && !!vehicleForTrip.data?.data) {
            data = vehicleForTrip.data.data
        } else if (vehiclesForLocation.data?.data) {
            data = vehiclesForLocation.data.data
        }

        if (!data) return []

        const vehiclesList = data.list ?? []
        const references = data.references
        const routes = references?.routes ?? {}
        const trips = references?.trips ?? {}

        return vehiclesList
            .map((vehicle) => {
                return {
                    headsign: vehicle.label,
                    tripId: trips[vehicle.tripId ?? ""]?.id,
                    routeId: routes[vehicle.routeId ?? ""]?.id,
                    vehicle,
                    route: routes[vehicle.routeId ?? ""],
                    trip: trips[vehicle.tripId ?? ""],
                } as Vehicle
            })
            .filter((v): v is Vehicle => !!(v.route && v.trip && v.vehicle))
    }, [vehiclesForLocation.data, tripIds])

    const vehiclesMap = useMemo(() => {
        const map = new Map<string, Vehicle>()
        vehicles.forEach((v) => {
            if (v.vehicle.vehicleId) map.set(v.vehicle.vehicleId, v)
        })
        return map
    }, [vehicles])

    return {
        ...vehiclesForLocation,
        vehicles,
        vehiclesMap,
    }
}
