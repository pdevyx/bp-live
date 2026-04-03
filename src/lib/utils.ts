import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { components } from "./api/v1";
import type { Vehicle } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export type SpriteData = {
  name: string,
  color?: string,
  secondaryColor?: string,
  scale?: number,
}

export type SpriteSource = Partial<Record<components["schemas"]["TransitRoute"]["type"], SpriteData>>

export function vehicleFromTripResponse(resp: components["schemas"]["TransitEntryWithReferencesTransitTripDetailsOTP"]) {
  const vehicle = resp.entry.vehicle

  const headsign = vehicle?.label;

  const route: components["schemas"]["TransitRoute"] = resp.references?.routes?.[vehicle?.routeId ?? ""]

  const trip: components["schemas"]["TransitTrip"] = resp?.entry

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
}

export const SPRITES = {
  "BUS": {
    name: "bus",
    color: "009EE3",
    secondaryColor: "FFFFFF",
    scale: 0.25,
  },
  "COACH": {
    name: "bus",
    color: "F9AB13",
    secondaryColor: "000000",
    scale: 0.25,
  },
  "TRAM": {
    name: "tram",
    color: "FFD800",
    secondaryColor: "000000",
    scale: 0.25,
  },
  "RAIL": {
    name: "rail",
    scale: 0.25,
  },
  "SUBURBAN_RAILWAY": {
    name: "suburban-railway",
    scale: 0.25,
  },
  "SUBWAY": {
    name: "subway",
    scale: 0.25,
  },
  "TROLLEYBUS": {
    name: "trolleybus",
    scale: 0.25,
  },
  "FERRY": {
    name: "ferry",
    scale: 0.25,
  },
} satisfies SpriteSource

export function loadSprites(map: maplibregl.Map, spriteSource: SpriteSource = SPRITES) {

  Object.keys(spriteSource).forEach((key) => {
    const data = spriteSource[key as components["schemas"]["TransitRoute"]["type"]]

    if (!map.hasImage(key) && data) {
      const url = `https://futar.bkk.hu/api/ui-service/v1/icon?name=${data.name}${data.color ? `&color=${data.color}` : ''}${data.secondaryColor ? `&secondaryColor=${data.secondaryColor}` : ''}${data.scale ? `&scale=${data.scale}` : ''}`

      map.loadImage(
        url
      ).then((image) => {
        if (image && !map.hasImage(key)) {
          map.addImage(key, image.data);
        }
      }).catch((error) => {
        console.error("Failed to load map image:", error);
      });
    }
  })
}