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

    const isTouchDevice =
        typeof window !== "undefined" &&
        window.matchMedia("(pointer: coarse)").matches

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
            if (!map) return
            const features = map.queryRenderedFeatures(e.point)
            if (features.length > 0 && features[0].layer.id !== layerId) {
                return
            }

            const isTouch =
                isTouchDevice ||
                (e.originalEvent &&
                    ("touches" in e.originalEvent ||
                        (e.originalEvent as PointerEvent).pointerType === "touch"))

            if (isTouch) {
                if (renderTooltip) {
                    handleFeatureEvent(e, setHoveredFeature)
                    if (e.features?.length) {
                        const feature = e.features[0]
                        const coordinates = (feature.geometry as GeoJSON.Point).coordinates as [number, number]
                        map.flyTo({ center: coordinates })
                    }
                }
                return
            }

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

    const handleMapClick = useEffectEvent((e: MapMouseEvent) => {
        if (!map || (!isTouchDevice && !hoveredFeature)) return
        const features = map.queryRenderedFeatures(e.point)
        if (!features.some((f) => f.layer.id === layerId)) {
            setHoveredFeature(null)
        }
    })

    const handleMouseMove = useEffectEvent(
        (
            e: (MapMouseEvent | MapTouchEvent) & {
                features?: MapGeoJSONFeature[]
            }
        ) => {
            if (!map || isTouchDevice) return
            
            const features = map.queryRenderedFeatures(e.point)
            if (features.length > 0 && features[0].layer.id !== layerId) {
                if (hoveredFeature) setHoveredFeature(null)
                return
            }

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

        map.on("click", handleMapClick)
        map.on("click", layerId, handleClick)
        map.on("mousemove", layerId, handleMouseMove)
        map.on("mouseleave", layerId, handleMouseLeave)

        return () => {
            map.off("click", handleMapClick)
            map.off("click", layerId, handleClick)
            map.off("mousemove", layerId, handleMouseMove)
            map.off("mouseleave", layerId, handleMouseLeave)

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
                    className={`border-none bg-transparent p-0 shadow-none ${isTouchDevice ? "pointer-events-auto" : "pointer-events-none"}`}
                    offset={15}
                >
                    <div
                        onClick={(e) => {
                            if (isTouchDevice) {
                                e.stopPropagation()
                                if (onClick) onClick(hoveredFeature.properties)
                                if (renderPopup) setSelectedFeature(hoveredFeature)
                            }
                        }}
                    >
                        {renderTooltip(hoveredFeature.properties)}
                    </div>
                </MapPopup>
            )}
        </>
    )
}

export { MapLayer }

export type { MapLayerProps }
