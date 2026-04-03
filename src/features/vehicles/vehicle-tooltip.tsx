import type { Vehicle } from "@/lib/types";
import { Accessibility } from "lucide-react";
import { Card, CardContent } from "../../components/ui/card";
import VehicleSummary from "./vehicle-summary";

export function VehicleCard({ vehicleData }: { vehicleData?: Vehicle }) {
    if (!vehicleData?.vehicle) return null;

    return (
        <Card className="min-w-40 bg-background/95 shadow-lg border-muted/20">
            <CardContent className="flex flex-col gap-1">
                <VehicleSummary route={vehicleData.route} headsign={vehicleData.headsign ?? ""} />

                <div className="flex items-center gap-1">
                    {vehicleData?.vehicle.wheelchairAccessible && (
                        <div className="flex flex-col items-center justify-center h-5 w-5 bg-gray-200 rounded-full">
                            <span className="text-blue-700 font-bold text-xs"><Accessibility size={16} /></span>
                        </div>
                    )}
                    <span className="font-bold font-mono text-xs pt-1">{vehicleData?.vehicle.licensePlate}</span>
                    <span>·</span>
                    <span className="text-xs">{vehicleData?.vehicle.model}</span>
                </div>
                {vehicleData.vehicle.status === "STOPPED_AT" && (
                    <small>
                        The vehicle is at the stop.
                    </small>
                )}

            </CardContent>
        </Card>
    )
}