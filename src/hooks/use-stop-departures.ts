import type { components } from "@/lib/api/v1"
import { $api } from "@/lib/client"
import { FUTAR_API_VERSION } from "@/lib/constants"
import type { StopArrivalsAndDeparturesResponse } from "@/lib/types"
import { useMemo } from "react"

export type StopDepartures = Omit<
    StopArrivalsAndDeparturesResponse["entry"],
    "stopTimes"
> & {
    stopTimes: (StopArrivalsAndDeparturesResponse["entry"]["stopTimes"] & {
        route?: components["schemas"]["TransitRoute"]
        trip?: components["schemas"]["TransitTrip"]
        vehicle?: components["schemas"]["TransitVehicle"]
    })[]
}

export default function useStopDepartures(stopId: string) {
    const query = $api.useQuery(
        "get",
        "/{dialect}/api/where/arrivals-and-departures-for-stop",
        {
            params: {
                path: { dialect: "mobile" },
                query: {
                    appVersion: import.meta.env.VITE_APP_VERSION ?? "1.0.0",
                    version: FUTAR_API_VERSION,
                    key: import.meta.env.VITE_FUTAR_API_KEY,
                    minutesBefore: 1,
                    minutesAfter: 30,
                    stopId: [stopId],
                },
            },
        },
        {
            refetchOnMount: true,
            refetchInterval: 5000,
        }
    )

    const data = query.data?.data as
        | StopArrivalsAndDeparturesResponse
        | undefined

    const stop = useMemo(() => {
        if (!data) return null

        return {
            ...data,

            stopTimes: data.entry.stopTimes.map((st) => {
                const trip = data.references?.trips?.find(
                    (t) => t.id === st.tripId
                )
                const route = data.references?.routes?.find(
                    (r) => r.id === trip?.routeId
                )
                const vehicle = st.vehicle

                return {
                    ...st,
                    route,
                    trip,
                    vehicle,
                }
            }),
        }
    }, [data])

    return {
        ...query,
        stop,
    }
}
