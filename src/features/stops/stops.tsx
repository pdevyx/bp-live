import { useStops } from "./use-stops"
import { useEffect, useMemo } from "react"
import { MarkersLayer } from "@/components/markers-layer"
import { useMap } from "@/components/ui/map"
import { createMultiColorRing, drawBearing } from "@/lib/map/icon-renderer"
import { Card, CardContent } from "@/components/ui/card"
import RouteList from "../routes/route-list"

export default function StopsLayer() {
    const { stops, stopsMap, data } = useStops()
    const { map, isLoaded } = useMap()

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
                },
            })),
        } satisfies GeoJSON.FeatureCollection

        return collection
    }, [stops])

    const stopBearings = useMemo(() => {
        const collection = {
            type: "FeatureCollection",
            features: stops
                .filter((s) => s.direction.length > 0)
                .map((s) => ({
                    type: "Feature",
                    geometry: { type: "Point", coordinates: [s.lon, s.lat] },
                    properties: {
                        id: s.id,
                        rotate: parseInt(s.direction, 10) || 0,
                    },
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
        <>
            <MarkersLayer
                data={stopBearings}
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
                        "icon-rotate": ["get", "rotate"],
                    },
                }}
            />
            <MarkersLayer
                data={stopFeatures}
                renderTooltip={(properties) => {
                    const stop = stopsMap.get(properties.id)
                    if (!stop) return null

                    return (
                        <Card className="max-w-2xs">
                            <CardContent className="flex flex-col gap-2">
                                <p className="text-sm font-semibold">
                                    {stop.name}
                                </p>
                                {/* <p>{stop.id}</p>
                                <pre>parent: {stop.parentStationId}</pre>
                                <p>{JSON.stringify(stop.style, undefined, 2)}</p>
                                <p>{stop.direction}</p> */}
                                <RouteList routes={stop.routes} />
                            </CardContent>
                        </Card>
                    )
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
                    },
                }}
            />
        </>
    )
}
