import { useMemo } from "react";
import type { Vehicle } from "./locations";
import Pajzs from "./route-label";
import { Card, CardContent } from "./ui/card";
import { MarkerTooltip, type MarkerTooltipProps } from "./ui/map";
import { Accessibility } from "lucide-react";

// NEW: Standalone card component
export function VehicleCard({ vehicleData }: { vehicleData: Vehicle }) {
    if (!vehicleData || !vehicleData.vehicle) return null;

    const vehicle = useMemo(() => {
        return {
            headsign: vehicleData.headsign,
            route: JSON.parse(vehicleData.route),
            trip: JSON.parse(vehicleData.trip),
            vehicle: JSON.parse(vehicleData.vehicle),
        }
    }, [vehicleData])

    return (
        <Card className="min-w-40 bg-background/95 shadow-lg border-muted/20">
            <CardContent>
                <div className="flex items-center gap-1.5 justify-start">
                    <div className="h-6 w-6 rounded-full" style={{ "backgroundColor": `#${vehicle?.route?.style?.vehicleIcon.color ?? vehicle?.route?.style?.color}` }}>
                        {/*            {vehicle?.route?.type} */}
                    </div>
                    <Pajzs text={vehicle?.route?.shortName ?? "?"} color={{
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