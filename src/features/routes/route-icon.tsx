import type { components } from "@/lib/api/v1"
import type { FunctionComponent, SVGProps } from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { routeIcons, type RouteIcon } from "@/lib/map/icons"

const iconVariants = cva("relative z-10", {
    variants: {
        size: {
            default: "size-7",
            "4xl": "size-32",
            xl: "size-10",
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
            "4xl": "size-31",
            xl: "size-9",
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
