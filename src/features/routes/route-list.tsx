import type { components } from "@/lib/api/v1";
import type React from "react";
import RouteLabel from "./route-label";
import { cn } from "@/lib/utils";
import RouteIcon from "./route-icon";

export default function RouteList({
    routes,
    className,
    ...props
}: React.ComponentProps<'div'> & { routes: components["schemas"]["TransitRoute"][] }) {

    if (routes.length === 0) {
        return null
    }

    return (
        <div className={cn("flex flex-col gap-1", className)} {...props}>
            {
                Object.entries(Object.groupBy(routes.sort((a, b) => a.sortOrder - b.sortOrder), (r) => `${r.type}_${r.style.vehicleIcon.name ?? "bus"}`))
                    .map(([_, value], i) => (
                        <div key={i} className="flex flex-col relative">
                            <RouteIcon className="absolute" size="sm" route={value[0]} />

                            <div className="ms-7 flex items-center gap-1 flex-wrap">
                                {
                                    value.map((r, i) => (
                                        <RouteLabel key={i} color={{
                                            "backgroundColor": `#${r.style?.color}`,
                                            "color": `#${r.style?.icon.textColor}`
                                        }}
                                            text={r.style?.icon.text}
                                            size="sm"
                                            type={r.style.icon.type}
                                        />
                                    ))
                                }
                            </div>
                        </div>
                    ))
            }
        </div>

    )
}