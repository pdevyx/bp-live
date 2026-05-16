import type { components } from "../api/v1"
import { generateStopIcon } from "./icon-renderer"
import { staticIcons } from "./icons"

export type SpriteData = {
    name: string
    color?: string
    secondaryColor?: string
    scale?: number
}

export type SpriteSource = Partial<
    Record<components["schemas"]["TransitRoute"]["type"] | string, SpriteData>
>


export const SPRITES = {
    BUS: {
        name: "bus",
        color: "009EE3",
        secondaryColor: "FFFFFF",
        scale: 0.25,
    },
    COACH: {
        name: "bus",
        color: "F9AB13",
        secondaryColor: "000000",
        scale: 0.25,
    },
    TRAM: {
        name: "tram",
        color: "FFD800",
        secondaryColor: "000000",
        scale: 0.25,
    },
    RAIL: {
        name: "rail",
        scale: 0.25,
    },
    SUBURBAN_RAILWAY: {
        name: "suburban-railway",
        scale: 0.25,
    },
    SUBWAY: {
        name: "subway",
        scale: 0.25,
    },
    TROLLEYBUS: {
        name: "trolleybus",
        scale: 0.25,
    },
    FERRY: {
        name: "ferry",
        scale: 0.25,
    },
    "stop-icon-M1": {
        name: "subway",
        color: "000000",
        secondaryColor: "FFD800",
        scale: 0.4,
    },
    "stop-icon-M2": {
        name: "subway",
        color: "FFFFFF",
        secondaryColor: "E41F18",
        scale: 0.4,
    },
    "stop-icon-M3": {
        name: "subway",
        color: "FFFFFF",
        secondaryColor: "005CA5",
        scale: 0.4,
    },
    "stop-icon-M4": {
        name: "subway",
        color: "FFFFFF",
        secondaryColor: "4CA22F",
        scale: 0.4,
    },
} satisfies SpriteSource

export async function loadSprites(
    map: maplibregl.Map,
) {
    await Promise.all(Object.keys(staticIcons).map(async (key) => {
        if (!map.hasImage(key)) {
            const img = await generateStopIcon(key as keyof typeof staticIcons)
            
            if (img && !map.hasImage(key)) {
                map.addImage(key, img)
            }
               
        }
    }))
}