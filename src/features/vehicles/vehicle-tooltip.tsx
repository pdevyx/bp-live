import type { Vehicle } from "@/lib/types"
import { Accessibility } from "lucide-react"
import { Card, CardContent } from "../../components/ui/card"
import VehicleSummary from "./vehicle-summary"

export function VehicleCard({ vehicleData }: { vehicleData?: Vehicle }) {
    if (!vehicleData?.vehicle) return null

    return (
        <Card className="min-w-40 border-muted/20 bg-background/95 shadow-lg">
            <CardContent className="flex flex-col gap-1">
                <VehicleSummary
                    route={vehicleData.route}
                    headsign={vehicleData.headsign ?? ""}
                />

                <div className="flex items-center gap-1">
                    {vehicleData?.vehicle.wheelchairAccessible && (
                        <div className="flex h-5 w-5 flex-col items-center justify-center rounded-full bg-gray-200">
                            <span className="text-xs font-bold text-blue-700">
                                <Accessibility size={16} />
                            </span>
                        </div>
                    )}
                    <span className="pt-1 font-mono text-xs font-bold">
                        {vehicleData?.vehicle.licensePlate}
                    </span>
                    <span>·</span>
                    <span className="text-xs">
                        {vehicleData?.vehicle.model}
                    </span>
                </div>
                {vehicleData.vehicle.status === "STOPPED_AT" && (
                    <small>The vehicle is at the stop.</small>
                )}
            </CardContent>
        </Card>
    )
}
