import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { components } from "./api/v1";
import type { Vehicle } from "./types";
import { fromUnixTime, format } from 'date-fns';
import { renderToStaticMarkup } from "react-dom/server";
import { createElement } from "react";
import { routeIcons, vehicleIcons, type RouteIcon } from "@/features/routes/route-icon";
import { Accessibility } from "lucide-react";


export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatTime(time: number | undefined) {
  return time ? format(fromUnixTime(time), 'HH:mm') : undefined
}

export type SpriteData = {
  name: string,
  color?: string,
  secondaryColor?: string,
  scale?: number,
}

export type SpriteSource = Partial<Record<components["schemas"]["TransitRoute"]["type"] | string, SpriteData>>

export function vehicleFromTripResponse(resp: components["schemas"]["TransitEntryWithReferencesTransitTripDetailsOTP"]) {
  const vehicle = resp.entry.vehicle

  const headsign = vehicle?.label;

  const trip: components["schemas"]["TransitTrip"] = resp.references?.trips?.[resp.entry.tripId ?? ""]

  const route: components["schemas"]["TransitRoute"] = resp.references?.routes?.[trip.routeId ?? ""]

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
  "stop-icon-M1": {
    name: "subway",
    color: "000000",
    secondaryColor: "FFD800",
    scale: 0.4
  },
  "stop-icon-M2": {
    name: "subway",
    color: "FFFFFF",
    secondaryColor: "E41F18",
    scale: 0.4
  },
  "stop-icon-M3": {
    name: "subway",
    color: "FFFFFF",
    secondaryColor: "005CA5",
    scale: 0.4
  },
  "stop-icon-M4": {
    name: "subway",
    color: "FFFFFF",
    secondaryColor: "4CA22F",
    scale: 0.4
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


export function drawBearing(color: string) {
  const size = 64; // Resolution of the icon
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  const center = size / 2;
  const height = 20
  const radius = 16;

  if (!ctx) return null

  ctx.fillStyle = color
  ctx.moveTo(center, 0)
  ctx.lineTo(center + radius, height)
  ctx.lineTo(center - radius, height)
  ctx.fill()

  return ctx.getImageData(0, 0, size, size);
}

export function createMultiColorRing(colors: string[]) {
  const size = 64; // Resolution of the icon
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  const center = size / 2;
  const radius = 16;
  const thickness = 6;

  const sliceAngle = (2 * Math.PI) / colors.length;

  if (!ctx) return null


  ctx.beginPath()
  ctx.arc(center, center, radius, 0, 2 * Math.PI)
  ctx.fillStyle = "#ffffff"
  ctx.fill()

  ctx.lineWidth = thickness;

  ctx.strokeStyle = "#ffffff";
  ctx.beginPath();
  ctx.arc(center, center, radius, 0, 2 * Math.PI)
  ctx.stroke();

  colors.forEach((color, i) => {
    const startAngle = i * sliceAngle;
    const endAngle = (i + 1) * sliceAngle;

    ctx.strokeStyle = color;
    ctx.beginPath();
    ctx.arc(center, center, radius - 2, startAngle, endAngle);
    ctx.stroke();
  });

  return ctx.getImageData(0, 0, size, size);
}

const _imageCache = new Map<string, HTMLImageElement>();

/**
 * Converts a React element (such as an SVGR component) into a usable HTMLImageElement.
 */
async function loadReactAsImage(element: React.ReactElement, cacheKey: string): Promise<HTMLImageElement> {
    if (_imageCache.has(cacheKey)) {
        return _imageCache.get(cacheKey)!;
    }

    const rawMarkup = renderToStaticMarkup(element);
    
    const svgMarkup = rawMarkup.includes('xmlns=') 
        ? rawMarkup 
        : rawMarkup.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"');
        
    const url = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgMarkup)}`;
    
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            _imageCache.set(cacheKey, img);
            resolve(img);
        };
        img.onerror = reject;
        img.src = url;
    });
}


/**
 * Generates a vehicle icon as ImageData based on the route type, colors, and accessibility features.
 * 
 * @param routeType eg. "BUS"
 * @param colorHex eg. "009EE3" (without #)
 * @param backgroundColorHex eg. "FFFFFF" (without #)
 * @param isAccessible Whether to include the accessibility badge (wheelchair icon)
 * @returns 
 */
export async function generateVehicleIcon(
    routeType: string,
    colorHex: string,
    backgroundColorHex: string,
    isAccessible: boolean,
): Promise<ImageData | null> {
    const size = 64; // Overall canvas size (bounds)
    const iconSize = 28; // Size of the central vehicle icon
    const offset = (size - iconSize) / 2; // Centers the icon (12px padding around)

    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    const { icon: IconComponent, primaryColor, secondaryColor } = vehicleIcons[routeType as keyof typeof vehicleIcons] ?? routeIcons["BUS"] as RouteIcon;
    
    const iconElement = createElement(IconComponent as any, { 
        fill: `#${primaryColor ?? colorHex}`, 
        width: iconSize, 
        height: iconSize 
    });

    const cacheKey = `vehicle-${routeType}-${colorHex}-${backgroundColorHex}-${isAccessible}`;
    const mainImg = await loadReactAsImage(iconElement, cacheKey);
    
    ctx.beginPath()
    ctx.arc(size / 2, size / 2, iconSize / 2 - 1, 0, Math.PI * 2)
    ctx.fillStyle = `#${secondaryColor ?? backgroundColorHex}`
    ctx.fill()

    ctx.drawImage(mainImg, offset, offset, iconSize, iconSize);

    if (isAccessible) {
      const badgeRadius = 6;
      const badgeX = size / 2 + iconSize / 2 - badgeRadius;     // Bottom Right X
      const badgeY = size / 2 + iconSize / 2 - badgeRadius;     // Bottom Right Y

        ctx.beginPath();
        ctx.arc(badgeX, badgeY, badgeRadius, 0, Math.PI * 2);
        ctx.fillStyle = "#FFFFFF"; 
        ctx.fill();
        ctx.strokeStyle = "#777777";
        ctx.stroke();

        const accessElement = createElement(Accessibility, { color: "black", width: 16, height: 16 });
        const accessImg = await loadReactAsImage(accessElement, 'icon-access-white');
        
        ctx.drawImage(accessImg, badgeX - 5, badgeY - 5, 10, 10);
    }

    return ctx.getImageData(0, 0, size, size);
}