import type { Vehicle } from "@/lib/types";
import { useLayer } from "../providers/context";
import { MarkersLayer } from "../components/markers-layer";
import { VehicleCard } from "../components/vehicle-tooltip";
import type { components } from "@/lib/api/v1";

export default function StopsLayer() {
    const { stopFeatures } = useLayer()

    return (
        <MarkersLayer
            data={stopFeatures}
            renderTooltip={(properties: components["schemas"]["TransitStop"]) => (
                // Type-cast properties back to Vehicle if needed, 
                // or rely on the data structure passed to GeoJSON
                <div>
                    <p className="text-lg">{properties.name}</p>
                    <p>{properties.id}</p>
                    <pre>parent: {properties.parentStationId}</pre>
                </div>
            )}
            layerProps={{
                type: "circle",
                paint: {
                    "circle-color": "#112233",
                    "circle-radius": [
                        "interpolate",
                        ["exponential", 2],
                        ["zoom"],
                        10, 2,
                        15, 7,
                        20, 7
                    ]
                },
                layout: {}
            }}
        />
    )
}