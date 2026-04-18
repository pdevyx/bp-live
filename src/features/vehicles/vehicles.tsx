import { useMap } from "@/components/ui/map"
import { drawBearing, generateVehicleIcon } from "@/lib/map/icon-renderer"
import { Link, useNavigate } from "@tanstack/react-router"
import type { FilterSpecification } from "maplibre-gl"
import { useEffect, useMemo } from "react"
import { MarkersLayer } from "../../components/markers-layer"
import { VehicleCard } from "./vehicle-tooltip"
import { useVehicles } from "./use-vehicles"
import type { Vehicle } from "@/lib/types"

function vehicleIconKey(v: Vehicle) {
    return `vehicle-${v.route?.type ?? "BUS"}-#${v.route?.style.vehicleIcon.color ?? "888888"}-${v.route?.style.vehicleIcon.secondaryColor ?? "ffffff"}-${v.vehicle.wheelchairAccessible ?? false}`
}

export default function VehiclesLayer({
    filter,
    tripIds,
}: {
    filter?: FilterSpecification,
    tripIds?: string[]
}) {
    const { vehicles, vehiclesMap } = useVehicles({ tripIds })
    const { map } = useMap()

    const vehicleFeatures = useMemo(
        () => ({
            type: "FeatureCollection" as const,
            features: vehicles.map((v) => ({
                type: "Feature" as const,
                geometry: {
                    type: "Point" as const,
                    coordinates: [
                        v.vehicle.location.lon,
                        v.vehicle.location.lat,
                    ],
                },
                properties: {
                    id: v.vehicle.vehicleId,
                    tripId: v.tripId,
                    "icon-image": vehicleIconKey(v),
                    color: `#${v.route?.style.vehicleIcon.color ?? v.route?.style.color}`,
                },
            })),
        }),
        [vehicles]
    )

    const vehicleBearings = useMemo(() => {
        const collection = {
            type: "FeatureCollection",
            features: vehicles
                .filter((v) => v.vehicle.bearing !== undefined)
                .map((v) => ({
                    type: "Feature",
                    geometry: {
                        type: "Point",
                        coordinates: [
                            v.vehicle.location.lon,
                            v.vehicle.location.lat,
                        ],
                    },
                    properties: {
                        rotate: v.vehicle.bearing,
                        tripId: v.tripId,
                        "icon-image":
                            v.vehicle.status === "STOPPED_AT"
                                ? "v-bearing-stopped"
                                : "v-bearing-moving",
                    },
                })),
        } satisfies GeoJSON.FeatureCollection

        return collection
    }, [vehicles])

    useEffect(() => {
        if (!map) return

        if (!map.hasImage("v-bearing-moving")) {
            const bearing = drawBearing("#888888")

            if (!bearing) throw Error(`Failed to draw icon image for bearing`)

            map.addImage("v-bearing-moving", bearing)
        }

        if (!map.hasImage("v-bearing-stopped")) {
            const bearing = drawBearing("#FF0000")

            if (!bearing) throw Error(`Failed to draw icon image for bearing`)

            map.addImage("v-bearing-stopped", bearing)
        }

        const loadVehicleIcons = async () => {
            await Promise.all(
                vehicles.map(async (v) => {
                    const id = vehicleIconKey(v)

                    const img = await generateVehicleIcon(
                        v.route?.type ?? "BUS",
                        v.route?.style.vehicleIcon.color ?? "888888",
                        v.route?.style.vehicleIcon.secondaryColor ?? "ffffff",
                        v.vehicle.wheelchairAccessible ?? false
                    )

                    if (!img) throw Error(`Failed to draw icon image for ${id}`)

                    if (map.hasImage(id)) {
                        map.updateImage(id, img)
                    } else {
                        map.addImage(id, img)
                    }
                })
            )
        }

        void loadVehicleIcons()
    }, [map, vehicles])

    const navigate = useNavigate()

    return (
        <>
            <MarkersLayer<{ id: string }>
                data={vehicleBearings}
                filter={filter}
                layerProps={{
                    type: "symbol",
                    minzoom: !!tripIds && tripIds.length > 0 ? undefined : 14,
                    layout: {
                        "icon-image": ["get", "icon-image"],
                        "icon-allow-overlap": true,
                        "icon-ignore-placement": true,
                        "icon-rotate": ["get", "rotate"],
                        "icon-size": 0.7,
                        "symbol-z-order": "viewport-y",
                    },
                }}
            />
            <MarkersLayer<{ id: string }>
                data={vehicleFeatures}
                filter={filter}
                renderTooltip={(properties) => {
                    const vehicle = vehiclesMap.get(properties.id)
                    if (!vehicle) return null
                    return <VehicleCard vehicleData={vehicle} />
                }}
                onClick={(properties) => {
                    const vehicle = vehiclesMap.get(properties.id)
                    if (!vehicle) return
                    console.log(vehicle)
                    navigate({ to: `/trip/${vehicle.tripId}`, from: "/" })
                }}
                layerProps={{
                    minzoom: !!tripIds && tripIds.length > 0 ? undefined : 14,
                }}
            />
        </>
    )
}
