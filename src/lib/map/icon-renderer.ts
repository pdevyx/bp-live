import {
    routeIcons,
    vehicleIcons,
    type RouteIcon,
} from "@/features/routes/route-icon"
import { Accessibility } from "lucide-react"
import { createElement } from "react"
import { renderToStaticMarkup } from "react-dom/server"

export function drawBearing(color: string) {
    const size = 64 // Resolution of the icon
    const canvas = document.createElement("canvas")
    canvas.width = size
    canvas.height = size
    const ctx = canvas.getContext("2d")
    const center = size / 2
    const height = 20
    const radius = 16

    if (!ctx) return null

    ctx.fillStyle = color
    ctx.moveTo(center, 0)
    ctx.lineTo(center + radius, height)
    ctx.lineTo(center - radius, height)
    ctx.fill()

    return ctx.getImageData(0, 0, size, size)
}

export function createMultiColorRing(colors: Array<string>) {
    const size = 64 // Resolution of the icon
    const canvas = document.createElement("canvas")
    canvas.width = size
    canvas.height = size
    const ctx = canvas.getContext("2d")
    const center = size / 2
    const radius = 16
    const thickness = 6

    const sliceAngle = (2 * Math.PI) / colors.length

    if (!ctx) return null

    ctx.beginPath()
    ctx.arc(center, center, radius, 0, 2 * Math.PI)
    ctx.fillStyle = "#ffffff"
    ctx.fill()

    ctx.lineWidth = thickness

    ctx.strokeStyle = "#ffffff"
    ctx.beginPath()
    ctx.arc(center, center, radius, 0, 2 * Math.PI)
    ctx.stroke()

    colors.forEach((color, i) => {
        const startAngle = i * sliceAngle
        const endAngle = (i + 1) * sliceAngle

        ctx.strokeStyle = color
        ctx.beginPath()
        ctx.arc(center, center, radius - 2, startAngle, endAngle)
        ctx.stroke()
    })

    return ctx.getImageData(0, 0, size, size)
}

const _imageCache = new Map<string, HTMLImageElement>()

/**
 * Converts a React element (such as an SVGR component) into a usable HTMLImageElement.
 */
async function loadReactAsImage(
    element: React.ReactElement,
    cacheKey: string
): Promise<HTMLImageElement> {
    if (_imageCache.has(cacheKey)) {
        return _imageCache.get(cacheKey)!
    }

    const rawMarkup = renderToStaticMarkup(element)

    const svgMarkup = rawMarkup.includes("xmlns=")
        ? rawMarkup
        : rawMarkup.replace("<svg", '<svg xmlns="http://www.w3.org/2000/svg"')

    const url = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgMarkup)}`

    return new Promise((resolve, reject) => {
        const img = new Image()
        img.onload = () => {
            _imageCache.set(cacheKey, img)
            resolve(img)
        }
        img.onerror = reject
        img.src = url
    })
}

/**
 * Generates a vehicle icon as ImageData based on the route type, colors, and accessibility features.
 *
 * @param type eg. "BUS"
 * @param colorHex eg. "009EE3" (without #)
 * @param backgroundColorHex eg. "FFFFFF" (without #)
 * @param isAccessible Whether to include the accessibility badge (wheelchair icon)
 * @returns
 */
export async function generateVehicleIcon(
    type: string,
    colorHex: string,
    backgroundColorHex: string,
    isAccessible: boolean
): Promise<ImageData | null> {
    const size = 64 // Overall canvas size (bounds)
    const iconSize = 28 // Size of the central vehicle icon
    const offset = (size - iconSize) / 2 // Centers the icon (12px padding around)

    const canvas = document.createElement("canvas")
    canvas.width = size
    canvas.height = size
    const ctx = canvas.getContext("2d")
    if (!ctx) return null

    let vehicleIcon = vehicleIcons[type.toUpperCase() as keyof typeof vehicleIcons]

    if (!vehicleIcon) {
        console.warn(`No icon found for route type ${type}, using default.`)

        vehicleIcon = vehicleIcons["BUS"] as RouteIcon
    }

    const {
        icon: IconComponent,
        primaryColor,
        secondaryColor,
    } = vehicleIcon

    const iconElement = createElement(IconComponent, {
        fill: `#${primaryColor ?? colorHex}`,
        width: iconSize,
        height: iconSize,
    })

    const cacheKey = `vehicle-${type}-${colorHex}-${backgroundColorHex}-${isAccessible}`
    const mainImg = await loadReactAsImage(iconElement, cacheKey)

    ctx.beginPath()
    ctx.arc(size / 2, size / 2, iconSize / 2 - 1, 0, Math.PI * 2)
    ctx.fillStyle = `#${secondaryColor ?? backgroundColorHex}`
    ctx.fill()

    ctx.drawImage(mainImg, offset, offset, iconSize, iconSize)

    if (isAccessible) {
        const badgeRadius = 6
        const badgeX = size / 2 + iconSize / 2 - badgeRadius // Bottom Right X
        const badgeY = size / 2 + iconSize / 2 - badgeRadius // Bottom Right Y

        ctx.beginPath()
        ctx.arc(badgeX, badgeY, badgeRadius, 0, Math.PI * 2)
        ctx.fillStyle = "#FFFFFF"
        ctx.fill()
        ctx.strokeStyle = "#777777"
        ctx.stroke()

        const accessElement = createElement(Accessibility, {
            color: "black",
            width: 16,
            height: 16,
        })
        const accessImg = await loadReactAsImage(
            accessElement,
            "icon-access-white"
        )

        ctx.drawImage(accessImg, badgeX - 5, badgeY - 5, 10, 10)
    }

    return ctx.getImageData(0, 0, size, size)
}
