import { createContext, useContext, useEffect, useId, useState } from "react"
import { useMap } from "./ui/map"
import type {
    GeoJSONSource,
} from "maplibre-gl"
import { loadSprites } from "@/lib/map/futar-icons"


type MapSourceContextValue = {
    sourceId: string
    isSourceLoaded: boolean
}

const MapSourceContext = createContext<MapSourceContextValue | null>(null)

function useMapSource() {
    const context = useContext(MapSourceContext)
    if (!context) {
        throw new Error("useMapSource must be used within a MapSource component")
    }
    return context
}

type MapSourceProps = {
    data: GeoJSON.FeatureCollection | string
    children: React.ReactNode
}

function MapSource({
    data,
    children
}: MapSourceProps) {
    const { map, isLoaded } = useMap()
    const id = useId()
    const sourceId = `map-source-${id}`

    useEffect(() => {
        const src = map?.getSource(sourceId) as GeoJSONSource | undefined
        if (src) {
            src.setData(data)
        }
    }, [data, map, sourceId])

    const [ isSourceLoaded, setIsSourceLoaded] = useState(false)

    useEffect(() => {
        if (!map || !isLoaded) return

        if (!map.getSource(sourceId)) {
            map.addSource(sourceId, {
                type: "geojson",
                data: data,
            })
            
            setIsSourceLoaded(true)
        }

        loadSprites(map)

        return () => {
            if (map?.getSource(sourceId)) {
                const style = map.getStyle()
                if (style && style.layers) {
                    style.layers.forEach((layer) => {
                        if ("source" in layer && layer.source === sourceId) {
                            map.removeLayer(layer.id)
                        }
                    })
                }
                map.removeSource(sourceId)
            }
            setIsSourceLoaded(false)
        }
    }, [map, isLoaded, sourceId])

    return (
        <MapSourceContext.Provider value={{ sourceId, isSourceLoaded }}>
            {children}
        </MapSourceContext.Provider>
    )
}

export {
    MapSource,
    useMapSource
}

export type { MapSourceProps }