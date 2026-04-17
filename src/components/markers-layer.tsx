import { useEffect, useEffectEvent, useId, useState } from "react"
import { MapPopup, useMap } from "./ui/map"
import type {
    AddLayerObject,
    FilterSpecification,
    GeoJSONSource,
    LayerSpecification,
    MapGeoJSONFeature,
    MapMouseEvent,
} from "maplibre-gl"
import { loadSprites } from "@/lib/utils"

type FeatureState<T> = {
    properties: T
    coordinates: [number, number]
} | null

interface MarkersLayerProps<T> {
    data: GeoJSON.FeatureCollection | string
    onClick?: (properties: FeatureState<T>) => void
    renderTooltip?: (properties: T) => React.ReactNode
    renderPopup?: (properties: T) => React.ReactNode
    layerProps?: AddLayerObject
    filter?: FilterSpecification
}

export function MarkersLayer<T = GeoJSON.GeoJsonProperties>({
    data,
    onClick,
    renderTooltip,
    renderPopup,
    layerProps,
    filter,
}: MarkersLayerProps<T>) {
    const { map, isLoaded } = useMap()
    const id = useId()
    const sourceId = `markers-source-${id}`
    const layerId = `markers-layer-${id}`

    const [selectedFeature, setSelectedFeature] =
        useState<FeatureState<T>>(null)
    const [hoveredFeature, setHoveredFeature] = useState<FeatureState<T>>(null)

    useEffect(() => {
        const src = map?.getSource(sourceId) as GeoJSONSource | undefined
        if (src) {
            console.log("updateData")
            src.setData(data)
        }
    }, [data, map, sourceId])

    const handleFeatureEvent = useEffectEvent(
        (
            e: MapMouseEvent & { features?: MapGeoJSONFeature[] },
            setter: React.Dispatch<React.SetStateAction<FeatureState<T>>>
        ) => {
            if (!e.features?.length) return

            const feature = e.features[0]
            const coordinates = (feature.geometry as GeoJSON.Point)
                .coordinates as [number, number]

            setter({
                properties: feature.properties as T,
                coordinates,
            })
        }
    )

    const handleClick = useEffectEvent(
        (e: MapMouseEvent & { features?: MapGeoJSONFeature[] }) => {
            if (onClick && e.features?.length) {
                onClick(e.features[0].properties as T)
            }

            if (renderPopup) {
                handleFeatureEvent(e, setSelectedFeature)
            }
        }
    )

    const handleMouseEnter = useEffectEvent(
        (e: MapMouseEvent & { features?: MapGeoJSONFeature[] }) => {
            if (!map) return
            map.getCanvas().style.cursor = "pointer"
            if (renderTooltip) {
                handleFeatureEvent(e, setHoveredFeature)
            }
        }
    )

    const handleMouseLeave = useEffectEvent(() => {
        if (!map) return
        map.getCanvas().style.cursor = ""
        if (renderTooltip) {
            setHoveredFeature(null)
        }
    })

    useEffect(() => {
        if (!map || !isLoaded) return

        if (!map.getSource(sourceId)) {
            console.log("addSource")
            map.addSource(sourceId, {
                type: "geojson",
                data: data,
            })
        }

        if (!map.getLayer(layerId)) {
            map.addLayer({
                id: layerId,
                source: sourceId,
                type: "symbol",
                layout: {
                    "icon-image": ["get", "icon-image"],
                    "icon-allow-overlap": true,
                    "icon-ignore-placement": true,
                },

                ...layerProps,
            })

            if (filter) {
                map.setFilter(layerId, filter)
            }

            loadSprites(map)
        }

        map.on("click", layerId, handleClick)
        map.on("mouseenter", layerId, handleMouseEnter)
        map.on("mouseleave", layerId, handleMouseLeave)

        return () => {
            map.off("click", layerId, handleClick)
            map.off("mouseenter", layerId, handleMouseEnter)
            map.off("mouseleave", layerId, handleMouseLeave)

            try {
                if (map.getLayer(layerId)) map.removeLayer(layerId)
                if (map.getSource(sourceId)) map.removeSource(sourceId)
            } catch {
                // ignore cleanup errors
            }
        }
    }, [map, isLoaded, sourceId, layerId])

    useEffect(() => {
        if (map?.getLayer(layerId)) {
            console.log("setFilter")
            map.setFilter(layerId, filter)
        }
    }, [map, layerId, filter])

    return (
        <>
            {selectedFeature && renderPopup && (
                <MapPopup
                    longitude={selectedFeature.coordinates[0]}
                    latitude={selectedFeature.coordinates[1]}
                    onClose={() => setSelectedFeature(null)}
                    closeOnClick={false}
                    offset={10}
                    closeButton
                >
                    {renderPopup(selectedFeature.properties)}
                </MapPopup>
            )}

            {hoveredFeature && renderTooltip && (
                <MapPopup
                    longitude={hoveredFeature.coordinates[0]}
                    latitude={hoveredFeature.coordinates[1]}
                    closeButton={false}
                    closeOnClick={false}
                    className="pointer-events-none border-none bg-transparent p-0 shadow-none"
                    offset={15}
                >
                    {renderTooltip(hoveredFeature.properties)}
                </MapPopup>
            )}
        </>
    )
}
