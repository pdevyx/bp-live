import { decode } from "@googlemaps/polyline-codec"
import { createFileRoute } from "@tanstack/react-router"
import { LngLatBounds, type PaddingOptions } from "maplibre-gl"
import { useLayoutEffect, useMemo, useRef } from "react"
import { MapRoute, useMap } from "@/components/ui/map"
import TripDetails from "@/features/trips/trip-details"
import VehiclesLayer from "@/features/vehicles/vehicles"
import { $api } from "@/lib/client"
import { FUTAR_API_VERSION } from "@/lib/constants"
import StopsLayer from "@/features/stops/stops"
import { vehicleFromTripResponse } from "@/lib/utils"
import { useIsMobile } from "@/hooks/use-mobile"
import type { TripDetailsResponse } from "@/lib/types"

export const Route = createFileRoute("/trip/$id/$date")({
    component: RouteComponent,
})

const MAP_BOUNDS_SMALL_PADDING = 100
const MAP_BOUNDS_LARGE_PADDING = 500

function RouteComponent() {
    const { id, date } = Route.useParams()

    const { map } = useMap()

    const isMobile = useIsMobile()
    const animated = useRef(false)

    const queryResult = $api.useQuery(
        "get",
        "/{dialect}/api/where/trip-details",
        {
            params: {
                path: {
                    dialect: "mobile",
                },
                query: {
                    appVersion: import.meta.env.VITE_APP_VERSION ?? "1.0.0",
                    version: FUTAR_API_VERSION,
                    key: import.meta.env.VITE_FUTAR_API_KEY,
                    tripId: id,
                    date: date,
                },
            },
        },
        {
            refetchInterval: 5000,
        }
    )

    const data = queryResult.data?.data as TripDetailsResponse | undefined

    const path: Array<[number, number]> = useMemo(() => {
        const points = data?.entry.polyline?.points

        if (!points) {
            return []
        }

        const decoded = decode(points).map(
            (l) => l.reverse() as [number, number]
        )

        return decoded
    }, [data])

    const vehicle = useMemo(
        () => data && vehicleFromTripResponse(data),
        [data]
    )

    const stopIds = useMemo(() => {
        return data && data.entry.stopTimes.map((st) => st.stopId)
    }, [data])

    useLayoutEffect(() => {
        if (!map || path.length === 0 || animated.current) return

        const bounds = path.reduce(
            (bnds, coord) => {
                return bnds.extend(coord)
            },
            new LngLatBounds(path[0], path[0])
        )

        const padding: PaddingOptions = {
            top: MAP_BOUNDS_SMALL_PADDING,
            bottom: isMobile ? MAP_BOUNDS_LARGE_PADDING : MAP_BOUNDS_SMALL_PADDING,
            left: isMobile ? MAP_BOUNDS_SMALL_PADDING : MAP_BOUNDS_LARGE_PADDING,
            right: MAP_BOUNDS_SMALL_PADDING,
        }

        map.fitBounds(bounds, { padding, maxZoom: 14 })

        animated.current = true
    }, [map, path, isMobile])

    return (
        <>
            {data && vehicle?.route && (
                <>
                    <MapRoute
                        coordinates={path}
                        color={`#${vehicle.route.style.color ?? "888"}`}
                        width={4}
                        opacity={0.8}
                    />
                    <StopsLayer
                        filter={
                            stopIds && [
                                "in",
                                ["get", "id"],
                                ["literal", stopIds],
                            ]
                        }
                    />
                    <VehiclesLayer tripIds={[id]} />
                    <TripDetails data={data} vehicle={vehicle} />
                </>
            )}
        </>
    )
}
