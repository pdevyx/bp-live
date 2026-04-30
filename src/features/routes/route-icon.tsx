import BusFull from "@/assets/icons/bus_full.svg?react"
import SuburbanBus from "@/assets/icons/suburbanbus_outer.svg?react"
import TrolleyFull from "@/assets/icons/trolley_full.svg?react"
import TramFull from "@/assets/icons/tram_outer.svg?react"
import RailroadFull from "@/assets/icons/railroad_full.svg?react"
import SuburbanRailwayFull from "@/assets/icons/hev.svg?react"
import Metro from "@/assets/icons/metro.svg?react"

import type { components } from "@/lib/api/v1"
import type { FunctionComponent, SVGProps } from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

export type RouteIcon = {
    icon: FunctionComponent<SVGProps<SVGSVGElement>>
    primaryColor?: string
    secondaryColor?: string
}

export type IconMap = Partial<{
    [key in components["schemas"]["TraverseMode"]]: RouteIcon
}> | {
    [key: string]: RouteIcon
}

export const routeIcons: IconMap = {
    BUS: {
        icon: BusFull,
    },
    NIGHT_BUS: {
        icon: BusFull,
    },
    TROLLEYBUS: {
        icon: TrolleyFull,
    },
    TRAM: {
        icon: TramFull,
    },
    COACH: {
        icon: SuburbanBus,
    },
    RAIL: {
        icon: RailroadFull,
        primaryColor: "023E84",
    },
    SUBURBAN_RAILWAY: {
        icon: SuburbanRailwayFull,
    },
    SUBWAY: {
        icon: Metro,
    },
}

export const vehicleIcons: IconMap = {
    ...routeIcons,

    SUBURBAN_RAILWAY: {
        icon: RailroadFull,
        primaryColor: "037831",
    },
    VEHICLE_SUBURBAN_RAILWAY: {
        icon: RailroadFull,
        primaryColor: "037831",
    },
}

const iconVariants = cva("relative z-10", {
    variants: {
        size: {
            default: "size-7",
            sm: "size-6",
            xs: "size-5",
        },
    },
    defaultVariants: {
        size: "default",
    },
})

const backgroundVariants = cva("absolute rounded-full", {
    variants: {
        size: {
            default: "size-6",
            sm: "size-5",
            xs: "size-4",
        },
    },
    defaultVariants: {
        size: "default",
    },
})

export default function RouteIcon({
    route,
    className,
    size = "default",
    ...props
}: React.ComponentProps<"div"> &
    VariantProps<typeof iconVariants> & {
        route: components["schemas"]["TransitRoute"]
    }) {
    const icon =
        (route.type
            ? routeIcons[route.type as keyof typeof routeIcons]
            : undefined) ?? (routeIcons["BUS"] as RouteIcon)

    return (
        <div
            className={cn(
                "relative flex items-center justify-center",
                className
            )}
            {...props}
        >
            <div
                className={backgroundVariants({ size })}
                style={{
                    backgroundColor: `#${icon.secondaryColor ?? route.style?.vehicleIcon.secondaryColor ?? "ffffff"}`,
                }}
            />
            <icon.icon
                className={iconVariants({ size })}
                fill={`#${icon.primaryColor ?? route.style?.vehicleIcon.color}`}
            />
        </div>
    )
}
