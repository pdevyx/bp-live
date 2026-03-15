import type { components } from "@/lib/api/v1";
import { useMap } from "./ui/map";
import { useEffect, useMemo, useState } from "react";
import { VehicleCard } from "./vehicle-tooltip";
import { $api } from "@/routes/__root";
import { useDebounce } from "use-debounce";
import { MarkersLayer } from "./markers-layer";

export type VehicleStyle = {
    icon: {
        color: string,
        secondaryColor: string,
        name: string,
    },
    color: string,
    textColor: string
}


export type Vehicle = {
    headsign: string | undefined,
    // style: VehicleStyle,
    vehicle: components["schemas"]["TransitVehicle"],
    route: components["schemas"]["TransitRoute"] | undefined,
    trip: components["schemas"]["TransitTrip"] | undefined | null,
}

export type BoundingBox = {
    lat: number,
    lon: number,
    latSpan: number,
    lonSpan: number
}

export default function Locations() {
    const { map, isLoaded } = useMap()

    const [bounds, setBounds] = useState<BoundingBox | null>(null)

    const [debouncedBounds] = useDebounce(bounds, 500)




    useEffect(() => {
        if (!map) return

        const updateBounds = () => {
            const current = map.getBounds()
            const center = current.getCenter()

            const latSpan = center.lat - current.getSouth()
            const lonSpan = center.lng - current.getWest()

            setBounds({
                lat: center.lat,
                lon: center.lng,
                latSpan,
                lonSpan
            })
        }

        map.on("moveend", updateBounds)

        return () => {
            map.off("moveend", updateBounds)
        }
    }, [map])


    const { data, error, isLoading } = $api.useQuery(
        "get",
        "/{dialect}/api/where/vehicles-for-location",
        {
            params: {
                path: {
                    dialect: "otp"

                },
                query: {
                    appVersion: "1.0.0",
                    version: "4",
                    key: import.meta.env.VITE_FUTAR_API_KEY,
                    ...debouncedBounds
                }
            },


        },
        {
            refetchInterval: 10000,
        }
    );


    const vehicles = useMemo(() => {
        const vehicles = data?.data.list ?? []
        const references = data?.data.references
        const routes = references?.routes
        const trips = references?.trips

        return vehicles.map((vehicle) => {
            const headsign = vehicle.label;

            const route: components["schemas"]["TransitRoute"] = routes[vehicle.routeId ?? ""];

            const trip: components["schemas"]["TransitTrip"] = trips?.[vehicle.tripId ?? ""]

            return {
                headsign,
                vehicle,
                route,
                trip,
            } satisfies Vehicle
        }).filter((v) => v.route && v.trip && v.vehicle);
    }, [data])

    const vehicleGeoJson = useMemo(() => ({
        type: 'FeatureCollection',
        features: vehicles.map(v => ({
            type: 'Feature',
            geometry: { type: 'Point', coordinates: [v.vehicle.location.lon, v.vehicle.location.lat] },
            properties: {
                ...v,
                "icon-image": v?.route?.type,
                color: `#${v?.route?.style?.vehicleIcon.color ?? v?.route?.style?.color}`,
            }
        }))
    }), [vehicles]);

    return (
        <>
            <MarkersLayer
                data={vehicleGeoJson}
                renderTooltip={(properties) => (
                    // Type-cast properties back to Vehicle if needed, 
                    // or rely on the data structure passed to GeoJSON
                    <VehicleCard vehicleData={properties as unknown as Vehicle} />
                )}
            />
            {/* {vehicles.map((vehicle, i) => (
                <MapMarker
                    key={vehicle.vehicle.vehicleId}
                    longitude={vehicle.vehicle.location.lon}
                    latitude={vehicle.vehicle.location.lat}
                >
                    <MarkerContent>
                        <div className="size-5 rounded-full border-2 border-white shadow-lg" style={{
                            "backgroundColor": `#${vehicle?.route?.style?.vehicleIcon.color ?? vehicle?.route?.style?.color}`
                        }}>
                        
                        <span className="flex flex-col items-center justify-center p-0 m-0" style={{
                            transform: `rotate(${vehicle?.vehicle?.bearing}deg) translate(0, -10px)`,
                            transformOrigin: ""
                        }}>▲</span>

                        </div>
                    </MarkerContent>
                    <VehicleTooltip vehicle={vehicle}/>
                    <MarkerPopup>
                        <div className="space-y-1">
                            <p className="font-medium text-foreground">{vehicle.route?.shortName ?? "?"} {">"} {vehicle.headsign ?? "?"}</p>
                            <p className="text-xs text-muted-foreground">
                                {vehicle.vehicle.location.lat.toFixed(4)}, {vehicle.vehicle.location.lon.toFixed(4)}
                            </p>
                            <pre className="max-h-40 overflow-auto">
                                {
                                    JSON.stringify(vehicle, null, 2)
                                }
                            </pre>
                        </div>
                    </MarkerPopup>
                </MapMarker>
            ))} */}
        </>

    )
}