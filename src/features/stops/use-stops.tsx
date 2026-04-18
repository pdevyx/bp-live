import type { components } from "@/lib/api/v1"
import { $api } from "@/lib/client"
import { FUTAR_API_VERSION } from "@/lib/constants"
import { useMapStore } from "@/store/map.store"
import { keepPreviousData } from "@tanstack/react-query"
import { useMemo } from "react"

export type MappedStop = {
    routes: components["schemas"]["TransitRoute"][]
} & components["schemas"]["TransitStop"]

export function useStops() {
    const bounds = useMapStore((state) => state.bounds)

    const query = $api.useQuery(
        "get",
        "/{dialect}/api/where/stops-for-location",
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
            placeholderData: keepPreviousData,
        },
        
    )

    const stops = useMemo(() => {
        const references = query.data?.data.references as
            | components["schemas"]["OTPTransitReferences"]
            | undefined
        const routeDict = references?.routes ?? {}

        const stops =
            query.data?.data.list.map((s) => {
                return {
                    ...s,
                    routes: s.routeIds.map((routeId) => routeDict[routeId]),
                }
            }) ?? ([] satisfies MappedStop[])

        return stops
    }, [query.data])

    const stopsMap = useMemo(() => {
        const map = new Map<string, MappedStop>()
        stops.forEach((s) => {
            if (s.id) map.set(s.id, s)
        })
        return map
    }, [stops])

    return {
        ...query,
        stops,
        stopsMap,
    }
}
