import { createFileRoute } from "@tanstack/react-router"
import { $api } from "../__root"
import { FUTAR_API_VERSION } from "@/lib/constants"
import { useEffect, useLayoutEffect, useMemo, useRef } from "react"
import { decode, encode } from "@googlemaps/polyline-codec"
import { MapRoute, useMap } from "@/components/ui/map"
import VehiclesLayer from "@/features/vehicles/vehicles"
import TripDetails from "@/features/trips/trip-details"
import StopsLayer from "@/features/stops/stops"
import { LngLatBounds } from "maplibre-gl"

export const Route = createFileRoute("/trip/$id")({
    component: RouteComponent,
})

function RouteComponent() {
    const { id } = Route.useParams()

    const { map } = useMap()

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
            placeholderData: (prev) => prev,
        }
    )

    const path: [number, number][] = useMemo(() => {
        const points = data?.data.entry.polyline?.points

        console.log(data)

        if (!points) {
            return []
        }

        const decoded = decode(points).map((l) => l.reverse())

        return decoded
    }, [data])

    useLayoutEffect(() => {
        if (!map || !path.length > 0 || animated.current) return

        const bounds = path.reduce(
            (bounds, coord) => {
                return bounds.extend(coord)
            },
            new LngLatBounds(path[0], path[0])
        )

        map.fitBounds(bounds, {
            padding: {
                top: 100,
                bottom: 100,
                left: 300,
                right: 50,
            },
        })

        animated.current = true
    }, [map, path])

    return (
        <>
            <MapRoute
                coordinates={path}
                color={`#${data?.data.entry.vehicle?.style?.icon.color ?? "888"}`}
                width={4}
                opacity={0.8}
                interactive={true}
            />
            <VehiclesLayer filter={["==", ["get", "tripId"], id]} />
            {data && <TripDetails data={data?.data} />}
        </>
    )
}
