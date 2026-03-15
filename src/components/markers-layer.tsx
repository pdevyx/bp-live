import { useEffect, useId, useState } from "react";
import { MapPopup, useMap } from "./ui/map";
import type { CanvasSourceSpecification, GeoJSONSource, MapGeoJSONFeature, MapMouseEvent } from "maplibre-gl";
import { loadSprites } from "@/lib/utils";

interface SelectedPoint {
    id: number;
    name: string;
    category: string;
    coordinates: [number, number];
}


interface MarkersLayerProps<T> {
    data: GeoJSON.FeatureCollection | string;
    renderTooltip?: (properties: T) => React.ReactNode;
}

export function MarkersLayer<T = any>({ data, renderTooltip }: MarkersLayerProps<T>) {
    const { map, isLoaded } = useMap();
    const id = useId();
    const sourceId = `markers-source-${id}`;
    const layerId = `markers-layer-${id}`;

    const [selectedPoint, setSelectedPoint] = useState<SelectedPoint | null>(
        null
    );

    // State for the hovered feature
    const [hoveredFeature, setHoveredFeature] = useState<{
        properties: T;
        coordinates: [number, number];
    } | null>(null);

    useEffect(() => {
        const src = map?.getSource(sourceId) satisfies GeoJSONSource | undefined
        if (src) {
            src.setData(data)
        }
    }, [data])

    useEffect(() => {
        if (!map || !isLoaded) return;



        map.addSource(sourceId, {
            type: "geojson",
            data: data,
        });

        map.addLayer({
            id: layerId,
            type: "symbol",
            source: sourceId,
            layout: {
                "icon-image": ["get", "icon-image"],
                "icon-allow-overlap": true,
                "icon-ignore-placement": true,
            }
        });

        const handleClick = (
            e: maplibregl.MapMouseEvent & {
                features?: maplibregl.MapGeoJSONFeature[];
            }
        ) => {
            if (!e.features?.length) return;

            const feature = e.features[0];
            const coords = (feature.geometry as GeoJSON.Point).coordinates as [
                number,
                number
            ];

            setSelectedPoint({
                id: feature.properties?.id,
                name: feature.properties?.name,
                category: feature.properties?.category,
                coordinates: coords,
            });
        };

        // TODO: REVIEW
        const handleMouseEnter = (e: MapMouseEvent & { features?: MapGeoJSONFeature[] }) => {
            map.getCanvas().style.cursor = "pointer";

            if (e.features?.length) {
                const feature = e.features[0];
                const coordinates = (feature.geometry as GeoJSON.Point).coordinates as [number, number];

                // Ensure properties are treated as the generic type T
                setHoveredFeature({
                    // @ts-expect-error MapLibre types vs Generic T
                    properties: feature.properties,
                    coordinates
                });
            }
        };

        const handleMouseLeave = () => {
            map.getCanvas().style.cursor = "";
            setHoveredFeature(null);
        };
        // TODO: END REVIEW

        map.on("click", layerId, handleClick);
        map.on("mouseenter", layerId, handleMouseEnter);
        map.on("mouseleave", layerId, handleMouseLeave);

        loadSprites(map)

        return () => {
            map.off("click", layerId, handleClick);
            map.off("mouseenter", layerId, handleMouseEnter);
            map.off("mouseleave", layerId, handleMouseLeave);

            try {
                if (map.getLayer(layerId)) map.removeLayer(layerId);
                if (map.getSource(sourceId)) map.removeSource(sourceId);
            } catch {
                // ignore cleanup errors
            }
        };
    }, [map, isLoaded, sourceId, layerId]);

    return (
        <>
            {selectedPoint && (
                <MapPopup
                    longitude={selectedPoint.coordinates[0]}
                    latitude={selectedPoint.coordinates[1]}
                    onClose={() => setSelectedPoint(null)}
                    closeOnClick={false}
                    focusAfterOpen={false}
                    offset={10}
                    closeButton
                >
                    <div className="min-w-[140px]">
                        <p className="font-medium">{selectedPoint.name}</p>
                        <p className="text-sm text-muted-foreground">
                            {selectedPoint.category}
                        </p>
                    </div>
                </MapPopup>
            )}

            {hoveredFeature && renderTooltip && (
                <MapPopup
                    longitude={hoveredFeature.coordinates[0]}
                    latitude={hoveredFeature.coordinates[1]}
                    closeButton={false}
                    closeOnClick={false}
                    className="p-0 bg-transparent shadow-none border-none pointer-events-none"
                    offset={15}
                >
                    {renderTooltip(hoveredFeature.properties)}
                </MapPopup>
            )}
        </>
    );
}