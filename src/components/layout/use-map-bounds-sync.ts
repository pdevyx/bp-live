import { useMap } from "@/components/ui/map"
import type { BoundingBox } from "@/lib/types"
import { useMapStore } from "@/store/map.store"
import { useEffect } from "react"

export function useMapBoundsSync() {
    const { map } = useMap()
    const setBounds = useMapStore((state) => state.setBounds)

    useEffect(() => {
        if (!map) return
        let timeoutId: NodeJS.Timeout

        const updateBounds = () => {
            clearTimeout(timeoutId)
            timeoutId = setTimeout(() => {
                const current = map.getBounds()
                const center = current.getCenter()

                const newBounds: BoundingBox = {
                    lat: center.lat,
                    lon: center.lng,
                    latSpan: center.lat - current.getSouth(),
                    lonSpan: center.lng - current.getWest(),
                }

                setBounds(newBounds)
            }, 500)
        }

        map.on("moveend", updateBounds)
        updateBounds() // Initial set

        return () => {
            map.off("moveend", updateBounds)
            clearTimeout(timeoutId)
        }
    }, [map, setBounds])
}
