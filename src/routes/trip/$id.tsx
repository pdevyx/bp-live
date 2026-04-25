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

export const Route = createFileRoute("/trip/$id")({
    component: RouteComponent,
})

const MAP_BOUNDS_SMALL_PADDING = 100
const MAP_BOUNDS_LARGE_PADDING = 500

function RouteComponent() {
    const { id } = Route.useParams()

    const { map } = useMap()

    const isMobile = useIsMobile()
    const animated = useRef(false)

    const { data } = $api.useQuery(
        "get",
        "/{dialect}/api/where/trip-details",
        {
            params: {
                path: {
                    dialect: "otp",
                },
                query: {
                    appVersion: import.meta.env.VITE_APP_VERSION ?? "1.0.0",
                    version: FUTAR_API_VERSION,
                    key: import.meta.env.VITE_FUTAR_API_KEY,
                    tripId: id,
                },
            },
        },
        {
            refetchInterval: 5000,
        }
    )

    const path: Array<[number, number]> = useMemo(() => {
        const points = data?.data.entry.polyline?.points

        if (!points) {
            return []
        }

        const decoded = decode(points).map(
            (l) => l.reverse() as [number, number]
        )

        return decoded
    }, [data])

    const vehicle = useMemo(
        () => data && vehicleFromTripResponse(data.data),
        [data]
    )

    const stopIds = useMemo(() => {
        return data && data.data.entry.stopTimes.map((st) => st.stopId)
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

        map.fitBounds(bounds, { padding })

        animated.current = true
    }, [map, path, isMobile])

    return (
        <>
            {data && vehicle && (
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
                    <TripDetails data={data.data} vehicle={vehicle} />
                </>
            )}
        </>
    )
}
