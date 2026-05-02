import { useStops } from "@/hooks/use-stops"
import { useEffect, useMemo } from "react"
import { MapLayer, type MapLayerProps } from "@/components/map-layer"
import { useMap } from "@/components/ui/map"
import { createMultiColorRing, drawBearing } from "@/lib/map/icon-renderer"
import { MapSource } from "@/components/map-source"
import StopTooltip from "./stop-tooltip"

type StopProperties = {
    id: string
    "icon-image": string
    rotate: number
    "bearing-rotate": number | null
    routeIds: string[]
}

export default function StopsLayer({
    filter,
}: Pick<MapLayerProps<StopProperties>, "filter">) {
    const { stops, stopsMap } = useStops()
    const { map } = useMap()

    const stopFeatures = useMemo(() => {
        const collection = {
            type: "FeatureCollection",
            features: stops.map((s) => ({
                type: "Feature",
                geometry: { type: "Point", coordinates: [s.lon, s.lat] },
                properties: {
                    id: s.id,
                    "icon-image": s.style.image?.includes("stop-icon-M")
                        ? s.style.image
                        : `ring-${s.style.colors.join("-")}`,
                    rotate: s.style.image ? 0 : parseInt(s.direction, 10) || 0,
                    "bearing-rotate": parseInt(s.direction, 10) || null,
                    routeIds: s.routeIds,
                } satisfies StopProperties,
            })),
        } satisfies GeoJSON.FeatureCollection

        return collection
    }, [stops])

    useEffect(() => {
        if (!map) return

        if (!map.hasImage("bearing")) {
            const bearing = drawBearing("#444444")

            if (!bearing) throw Error(`Failed to draw icon image for bearing`)

            map.addImage("bearing", bearing)
        }

        new Set(stops.map((s) => `${s.style.colors.join("-")}`)).forEach(
            (stringColors) => {
                const imageId = `ring-${stringColors}`

                const img = createMultiColorRing(
                    stringColors.split("-").map((color) => `#${color}`)
                )

                if (!img)
                    throw Error(`Failed to draw icon image for ${imageId}`)

                if (map.hasImage(imageId)) {
                    map.updateImage(imageId, img)
                } else {
                    map.addImage(imageId, img)
                }
            }
        )
    }, [stops])

    return (
        <MapSource data={stopFeatures}>
            <MapLayer
                filter={["!=", ["get", "bearing-rotate"], null]}
                layerProps={{
                    type: "symbol",
                    minzoom: 12,
                    layout: {
                        "icon-image": "bearing",
                        "icon-allow-overlap": true,
                        "icon-ignore-placement": true,
                        "icon-size": [
                            "interpolate",
                            ["linear"],
                            ["zoom"],
                            12,
                            0.001,
                            13,
                            0.3,
                            15,
                            0.4,
                            20,
                            0.5,
                        ],
                        "icon-rotation-alignment": "map",
                        "icon-pitch-alignment": "map",
                        "icon-rotate": ["get", "bearing-rotate"],
                    },
                }}
            />
            <MapLayer
                filter={filter}
                renderTooltip={(properties) => {
                    const stop = properties && stopsMap.get(properties.id)
                    if (!stop) return null

                    return <StopTooltip stop={stop} />
                }}
                layerProps={{
                    type: "symbol",
                    minzoom: 12,
                    layout: {
                        "icon-image": ["get", "icon-image"],
                        "icon-allow-overlap": true,
                        "icon-ignore-placement": true,
                        "icon-size": [
                            "interpolate",
                            ["linear"],
                            ["zoom"],
                            12,
                            0.001,
                            13,
                            0.3,
                            15,
                            0.4,
                            20,
                            0.5,
                        ],
                        "icon-rotate": ["get", "rotate"],
                        "icon-pitch-alignment": "map",
                    },
                }}
            />
        </MapSource>
    )
}
