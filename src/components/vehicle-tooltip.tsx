import { useMemo } from "react";
import RouteLabel from "./route-label";
import { Card, CardContent } from "./ui/card";
import { MarkerTooltip, type MarkerTooltipProps } from "./ui/map";
import { Accessibility } from "lucide-react";
import type { Vehicle, VehicleStr } from "@/lib/types";

// NEW: Standalone card component
export function VehicleCard({ vehicleDataStr, vehicleData }: { vehicleDataStr: VehicleStr, vehicleData: Vehicle }) {
    if (!vehicleData?.vehicle && !vehicleDataStr?.vehicle) return null;

    const vehicle = useMemo(() => {

        if (vehicleDataStr) {
            return {
                headsign: vehicleDataStr.headsign,
                route: JSON.parse(vehicleDataStr.route),
                trip: JSON.parse(vehicleDataStr.trip),
                vehicle: JSON.parse(vehicleDataStr.vehicle),
            }
        }

return {
            headsign: vehicleData.headsign,
            route: vehicleData.route,
            trip: vehicleData.trip,
            vehicle: vehicleData.vehicle,
        }


    }, [vehicleData])

    return (
        <Card className="min-w-40 bg-background/95 shadow-lg border-muted/20">
            <CardContent>
                <div className="flex items-center gap-1.5 justify-start">
                    <div className="h-6 w-6 rounded-full" style={{ "backgroundColor": `#${vehicle?.route?.style?.vehicleIcon.color ?? vehicle?.route?.style?.color}` }}>
                        {/*            {vehicle?.route?.type} */}
                    </div>
                    <RouteLabel text={vehicle?.route?.shortName ?? "?"} color={{
                        "backgroundColor": `#${vehicle?.route?.style?.vehicleIcon.color ?? vehicle?.route?.style?.color}`,
                        "color": `#${vehicle?.route?.style?.vehicleIcon.secondaryColor}`
                    }} />
                    <span className="text-lg">▶</span>

                    <span className="font-bold text-sm">{vehicle?.headsign}</span>
                </div>


                <div className="flex items-center gap-1">
                    {vehicle?.vehicle.wheelchairAccessible && (
                        <div className="flex flex-col items-center justify-center h-5 w-5 bg-gray-200 rounded-full">
                            <span className="text-blue-700 font-bold text-xs"><Accessibility size={16} /></span>
                        </div>
                    )}
                    <span className="font-bold font-mono text-xs">{vehicle?.vehicle.licensePlate}</span>
                    <span>·</span>
                    <span className="text-xs">{vehicle?.vehicle.model}</span>
                </div>

            </CardContent>
        </Card>
    )
}

// Keep original for compatibility if needed
export default function VehicleTooltip({
    vehicle,
    ...props
}: Omit<MarkerTooltipProps, "children"> & { vehicle: Vehicle }) {
    return (
        <MarkerTooltip className="p-0 bg-transparent border-none shadow-none" anchor="top-right" {...props}>
            <VehicleCard vehicleData={vehicle} />
        </MarkerTooltip>
    )
}