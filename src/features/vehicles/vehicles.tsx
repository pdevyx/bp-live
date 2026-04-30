import { useMap } from "@/components/ui/map"
import { drawBearing, generateVehicleIcon } from "@/lib/map/icon-renderer"
import { useNavigate } from "@tanstack/react-router"
import { useEffect, useMemo, useRef } from "react"

import { useVehicles } from "./use-vehicles"
import type { Vehicle } from "@/lib/types"
import { VehicleCard } from "./vehicle-tooltip"
import { MapLayer, type MapLayerProps } from "@/components/map-layer"
import { MapSource } from "@/components/map-source"

function vehicleIconKey(vis: VehicleVisualization) {
    return `vehicle-${vis.icon}-#${vis.primaryColor}-${vis.secondaryColor}-${vis.isAccessible}`
}

export type VehicleVisualization = {
    icon: string,
    primaryColor: string,
    secondaryColor: string,
    isAccessible: boolean
}

function vehicleVisualization(v: Vehicle): VehicleVisualization {
    return {
         icon: (v.vehicle.style?.icon?.name ?? v.route?.type ?? "BUS").replaceAll("inactive-", "").replaceAll("-", "_"),
         primaryColor: v.vehicle.style?.icon?.color ?? "888888",
         secondaryColor: v.vehicle.style?.icon?.secondaryColor ?? "ffffff",
         isAccessible: v.vehicle.wheelchairAccessible ?? false
    }
}

export default function VehiclesLayer({
    filter,
    tripIds,
}: Pick<MapLayerProps<{ id: string }>, "filter"> & {
    tripIds?: string[]
}) {
    const { vehicles, vehiclesMap } = useVehicles({ tripIds })
    const { map } = useMap()
    const generatingIcons = useRef(new Set<string>())

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
                    "icon-image": vehicleIconKey(vehicleVisualization(v)),
                    "bearing-icon-image":
                            v.vehicle.status === "STOPPED_AT"
                                ? "v-bearing-stopped"
                                : "v-bearing-moving",
                    "bearing-icon-rotate": v.vehicle.bearing,
                    color: `#${v.route?.style.vehicleIcon.color ?? v.route?.style.color}`,
                },
            })),
        }),
        [vehicles]
    )

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


        const uniqueVisualizations = new Map<string, VehicleVisualization>()

        vehicles.forEach((v) => {
            const vis = vehicleVisualization(v)
            const id = vehicleIconKey(vis)

            if (!map.hasImage(id) && !generatingIcons.current.has(id)) {
                uniqueVisualizations.set(id, vis)
            }
        })

        uniqueVisualizations.forEach((vis, id) => {
            generatingIcons.current.add(id)

            generateVehicleIcon(
                vis.icon,
                vis.primaryColor,
                vis.secondaryColor,
                vis.isAccessible
            ).then((img) => {
                if (!img) throw Error(`Failed to draw icon image for ${id}`)
                    
                if (!map.hasImage(id)) {
                    map.addImage(id, img)
                }
            }).finally(() => {
                generatingIcons.current.delete(id)
            })
        })
       
    }, [map, vehicles])

    const navigate = useNavigate()

    return (
        
        <MapSource data={vehicleFeatures}>
            <MapLayer<{ id: string }>
                filter={filter}
                layerProps={{
                    type: "symbol",
                    minzoom: !!tripIds && tripIds.length > 0 ? undefined : 14,
                    layout: {
                        "icon-image": ["get", "bearing-icon-image"],
                        "icon-allow-overlap": true,
                        "icon-ignore-placement": true,
                        "icon-rotate": ["get", "bearing-icon-rotate"],
                        "icon-rotation-alignment": "map",
                        "icon-pitch-alignment": "map",
                        "icon-size": 0.8,
                    },
                }}
            />
            <MapLayer<{ id: string }>
                filter={filter}
                renderTooltip={(properties) => {
                    const vehicle = vehiclesMap.get(properties.id)
                    if (!vehicle) return null
                    return <VehicleCard vehicleData={vehicle} />
                }}
                onClick={(properties) => {
                    const vehicle = vehiclesMap.get(properties.id)
                    if (!vehicle || !vehicle.tripId) return
                    navigate({ to: `/trip/${vehicle.tripId}/${vehicle.vehicle.serviceDate}`, from: "/" })
                }}
                layerProps={{
                    minzoom: !!tripIds && tripIds.length > 0 ? undefined : 14,
                    layout: {
                        "icon-image": ["get", "icon-image"],
                        "icon-allow-overlap": true,
                        "icon-ignore-placement": true,
                        "icon-pitch-alignment": "map",
                        "icon-size": 0.5
                    },
                }}
            />
        </MapSource>
        
    )
}
