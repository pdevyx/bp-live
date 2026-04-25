import { useEffect, useEffectEvent, useId, useState } from "react"
import { MapPopup, useMap } from "./ui/map"
import type {
    AddLayerObject,
    FilterSpecification,
    MapGeoJSONFeature,
    MapMouseEvent,
    MapTouchEvent,
} from "maplibre-gl"
import { useMapSource } from "./map-source"

type FeatureState<T> = {
    properties: T
    coordinates: [number, number]
} | null

type MapLayerProps<T> = {
    onClick?: (properties: T) => void
    renderTooltip?: (properties: T) => React.ReactNode
    renderPopup?: (properties: T) => React.ReactNode
    layerProps?: Omit<AddLayerObject, "id" | "source" | "type">
    filter?: FilterSpecification
}

function MapLayer<T = GeoJSON.GeoJsonProperties>({
    onClick,
    renderTooltip,
    renderPopup,
    layerProps,
    filter,
}: MapLayerProps<T>) {
    const { map, isLoaded } = useMap()
    const { sourceId, isSourceLoaded } = useMapSource()

    const id = useId()
    const layerId = `markers-layer-${id}`

    const [selectedFeature, setSelectedFeature] =
        useState<FeatureState<T>>(null)
    const [hoveredFeature, setHoveredFeature] = useState<FeatureState<T>>(null)

    const handleFeatureEvent = useEffectEvent(
        (
            e: (MapMouseEvent | MapTouchEvent) & {
                features?: MapGeoJSONFeature[]
            },
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

            if (!e.features?.length) {
                setHoveredFeature(null)
            }
        }
    )

    const handleMouseEnter = useEffectEvent(
        (
            e: (MapMouseEvent | MapTouchEvent) & {
                features?: MapGeoJSONFeature[]
            }
        ) => {
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

        if (isSourceLoaded && !map.getLayer(layerId)) {
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
        }

        map.on("click", layerId, handleClick)
        map.on("mouseenter", layerId, handleMouseEnter)
        map.on("mouseleave", layerId, handleMouseLeave)
        map.on("touchstart", layerId, handleMouseEnter)
        map.on("touchend", layerId, handleMouseLeave)

        return () => {
            map.off("click", layerId, handleClick)
            map.off("mouseenter", layerId, handleMouseEnter)
            map.off("mouseleave", layerId, handleMouseLeave)
            map.off("touchstart", layerId, handleMouseEnter)
            map.off("touchend", layerId, handleMouseLeave)

            if (map.getLayer(layerId)) {
                map.removeLayer(layerId)
            }
        }
    }, [map, isLoaded, isSourceLoaded, sourceId, layerId])

    useEffect(() => {
        if (!map) return

        if (
            map.getLayer(layerId) !== undefined &&
            map.getFilter(layerId) !== filter
        ) {
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

export { MapLayer }

export type { MapLayerProps }
