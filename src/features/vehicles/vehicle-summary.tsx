import type { components } from "@/lib/api/v1"
import RouteLabel from "../routes/route-label"
import RouteIcon from "../routes/route-icon"
import { cn } from "@/lib/utils"

export type VehicleSummaryProps = {
    route: components["schemas"]["TransitRoute"]
    headsign: string
    size?: "default" | "sm" | "xs"
}

export default function VehicleSummary({
    route,
    headsign,
    className,
    size = "default",
    ...props
}: React.ComponentProps<"div"> & VehicleSummaryProps) {
    return (
        <div
            className={cn(
                "flex items-center justify-start gap-1.5 font-noto",
                className
            )}
            {...props}
        >
            <RouteIcon route={route} size={size} />

            <RouteLabel
                text={route?.shortName ?? "?"}
                color={{
                    backgroundColor: `#${route.style?.vehicleIcon.color ?? route.style?.color}`,
                    color: `#${route?.style?.icon.textColor}`,
                }}
                type={route?.style.icon.type ?? "BOX"}
                size={size}
            />
            <span className="font-mono text-lg">▶</span>

            <span className="text-sm font-bold">{headsign}</span>
        </div>
    )
}
