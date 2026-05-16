import type { components } from "@/lib/api/v1"
import RouteLabel from "../routes/route-label"
import RouteIcon from "../routes/route-icon"
import { cn } from "@/lib/utils"
import { cva, type VariantProps } from "class-variance-authority"

export type VehicleSummaryProps = {
    route: components["schemas"]["TransitRoute"] | undefined
    headsign: string
    icon?: boolean
}

const triangleVariants = cva("font-mono", {
    variants: {
        size: {
            default: "text-lg",
            sm: "text-lg",
            xs: "text-sm",
            xl: "text-2xl",
            "4xl": "text-7xl",
        },
    },
    defaultVariants: {
        size: "default",
    },
})

const headsignVariants = cva("text-balance", {
    variants: {
        size: {
            default: "text-sm font-bold",
            sm: "text-xs",
            xs: "text-xs",
            xl: "text-2xl",
            "4xl": "text-6xl font-bold",
        },
    },
    defaultVariants: {
        size: "default",
    },
})

export default function VehicleSummary({
    route,
    headsign,
    className,
    size = "default",
    icon = true,
    ...props
}: React.ComponentProps<"div"> & VehicleSummaryProps & VariantProps<typeof headsignVariants> ) {
    return (
        <div
            className={cn(
                "flex items-center justify-start gap-1.5 font-noto",
                className
            )}
            {...props}
        >
            {route && (
                <>
                   { icon && <RouteIcon route={route} size={size} />}
                    <RouteLabel
                        text={
                            route?.style?.icon?.text ?? route?.shortName ?? "?"
                        }
                        color={{
                            backgroundColor: `#${route.style?.vehicleIcon.color ?? route.style?.color}`,
                            color: `#${route?.style?.icon.textColor}`,
                        }}
                        type={route?.style.icon.type ?? "BOX"}
                        size={size}
                    />
                    <span className={triangleVariants({ size })}>▶</span>

                    <span className={headsignVariants({ size })}>
                        {headsign}
                    </span>
                </>
            )}
        </div>
    )
}
