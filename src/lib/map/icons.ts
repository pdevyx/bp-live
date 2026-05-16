import BusFull from "@/assets/icons/bus_full.svg?react"
import SuburbanBus from "@/assets/icons/suburbanbus_outer.svg?react"
import TrolleyFull from "@/assets/icons/trolley_full.svg?react"
import TramFull from "@/assets/icons/tram_outer.svg?react"
import RailroadFull from "@/assets/icons/railroad_full.svg?react"
import SuburbanRailwayFull from "@/assets/icons/hev.svg?react"
import Metro from "@/assets/icons/metro.svg?react"
import MetroFull from "@/assets/icons/metro_full.svg?react"
import Duna from "@/assets/icons/duna.svg?react"
import type { components } from "../api/v1"
import type { FunctionComponent, SVGProps } from "react"

export type RouteIcon = {
    icon: FunctionComponent<SVGProps<SVGSVGElement>>
    primaryColor?: string
    secondaryColor?: string
}

export type IconMap =
    | Partial<{
          [key in components["schemas"]["TraverseMode"]]: RouteIcon
      }>
    | {
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
    FERRY: {
        icon: Duna,
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

export const staticIcons = {
    "stop-icon-M1": {
        icon: MetroFull,
        primaryColor: "FFD800",
        secondaryColor: "000000",
    },
    "stop-icon-M2": {
        icon: MetroFull,
        primaryColor: "E41F18",
        secondaryColor: "FFFFFF",
    },
    "stop-icon-M3": {
        icon: MetroFull,
        primaryColor: "005CA5",
        secondaryColor: "FFFFFF",
    },
    "stop-icon-M4": {
        icon: MetroFull,
        primaryColor: "4CA22F",
        secondaryColor: "FFFFFF",
    },
} as const satisfies IconMap
