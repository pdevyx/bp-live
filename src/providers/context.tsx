import type { BoundingBox, Vehicle } from "@/lib/types";
import { $api } from "@/routes/__root";
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useMap } from "../components/ui/map";
import { FUTAR_API_VERSION } from "@/lib/constants";
import type { components } from "@/lib/api/v1";
import { useDebounce } from "use-debounce";

type LayerContextValue = {
    vehicleFeatures: GeoJSON.FeatureCollection,
    stopFeatures: GeoJSON.FeatureCollection,
};

const LayerContext = createContext<LayerContextValue | null>(null);

export function useLayer() {
    const context = useContext(LayerContext);
    if (!context) {
        throw new Error("useLayer must be used within a LayerContextProvider component");
    }
    return context;
}

export function LayerContextProvider({
    children
}: { children: React.ReactNode }) {
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


    const { data: vehiclesData, error, isLoading } = $api.useQuery(
        "get",
        "/{dialect}/api/where/vehicles-for-location",
        {
            params: {
                path: {
                    dialect: "otp"

                },
                query: {
                    appVersion: import.meta.env.VITE_APP_VERSION ?? "1.0.0",
                    version: FUTAR_API_VERSION,
                    key: import.meta.env.VITE_FUTAR_API_KEY,
                    ...debouncedBounds
                }
            },


        },
        {
            refetchInterval: 10000,
            placeholderData: (prev) => prev
        }
    );

    const { data: stopsData } = $api.useQuery(
        "get",
        "/{dialect}/api/where/stops-for-location",
        {
            params: {
                path: {
                    dialect: "otp"

                },
                query: {
                    appVersion: import.meta.env.VITE_APP_VERSION ?? "1.0.0",
                    version: FUTAR_API_VERSION,
                    key: import.meta.env.VITE_FUTAR_API_KEY,
                    ...debouncedBounds
                }
            },


        },
        {
            refetchInterval: 10000,
            placeholderData: (prev) => prev
        }
    );

    const vehicles = useMemo(() => {
        const vehicles = vehiclesData?.data.list ?? []
        const references = vehiclesData?.data.references
        const routes = references?.routes
        const trips = references?.trips

        return vehicles.map((vehicle) => {
            const headsign = vehicle.label;

            const route: components["schemas"]["TransitRoute"] = routes[vehicle.routeId ?? ""];

            const trip: components["schemas"]["TransitTrip"] = trips?.[vehicle.tripId ?? ""]

            const tripId = trip?.id
            const routeId = route?.id

            return {
                headsign,
                tripId,
                routeId,
                vehicle,
                route,
                trip,
            } satisfies Vehicle
        }).filter((v) => v.route && v.trip && v.vehicle);
    }, [vehiclesData])

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

    const stops = useMemo(() => {
        const stops = stopsData?.data.list ?? []

        return stops
    }, [stopsData])

    const stopsGeoJson = useMemo(() => {

        const collection = {
            type: 'FeatureCollection',
            features: stops.map(s => ({
                type: 'Feature',
                geometry: { type: 'Point', coordinates: [s.lon, s.lat] },
                properties: {
                    ...s,
                }
            }))
        } satisfies GeoJSON.FeatureCollection

        return collection
    }, [stops]);


    const contextValue = useMemo(
        () => ({
            vehicleFeatures: vehicleGeoJson,
            stopFeatures: stopsGeoJson
        }),
        [vehicleGeoJson, stopsGeoJson]
    );

    return (
        <LayerContext.Provider value={contextValue}>
            {children}
        </LayerContext.Provider>
    )
}