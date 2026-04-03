import type { Vehicle } from "@/lib/types";
import { useLayer } from "./context";
import { MarkersLayer } from "./markers-layer";
import { VehicleCard } from "./vehicle-tooltip";
import { Link, useNavigate, useRouter } from "@tanstack/react-router";
import type { FilterSpecification } from "maplibre-gl";

export default function VehiclesLayer({ filter }: { filter?: FilterSpecification}) {
    const { vehicleFeatures } = useLayer()

    const navigate = useNavigate()

    return (
        <MarkersLayer
            data={vehicleFeatures}
            filter={filter}
            renderTooltip={(properties) => (
                // Type-cast properties back to Vehicle if needed, 
                // or rely on the data structure passed to GeoJSON
                <VehicleCard vehicleDataStr={properties as unknown as Vehicle} />
            )}
            onClick={(properties: Vehicle) => {
                console.log(properties)
                navigate({ to: `./trip/${properties.tripId}`} )
            }}
            renderPopup={(properties: Vehicle) => (
                <div className="flex max-h-md max-w-lg overflow-scroll">
                    
                    <Link to={`/trip/${properties.tripId}`}>View trip!</Link>
                    <pre>
                        { JSON.stringify(JSON.parse(properties.trip ?? "{}"), undefined, 2) }
                    </pre>
                    <pre>
                        { JSON.stringify(properties, undefined, 2) }
                    </pre>
                </div>
            )}
        />
    )
}