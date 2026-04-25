import { XIcon } from "lucide-react"
import { Button } from "../../components/ui/button"
import { Link } from "@tanstack/react-router"
import type { components } from "@/lib/api/v1"
import StopTimesEntry from "./stop-time-entry"
import VehicleSummary from "../vehicles/vehicle-summary"
import type { Vehicle } from "@/lib/types"

export default function TripDetails({
    data,
    vehicle,
}: {
    data: components["schemas"]["TransitEntryWithReferencesTransitTripDetailsOTP"]
    vehicle: Vehicle
}) {
    return (
        <div className="absolute bottom-0 z-10 flex min-h-1/3 max-h-1/2 w-full flex-col items-center gap-2 rounded-tl-xl rounded-tr-xl bg-card pt-4 sm:w-fit sm:rounded-none sm:rounded-tr-xl lg:top-16 lg:max-h-screen lg:max-w-1/3 lg:rounded-none">
            <div className="flex w-full items-center justify-between gap-2 px-4">
                <VehicleSummary
                    route={vehicle.route}
                    headsign={
                        vehicle.headsign ?? vehicle.trip?.tripHeadsign ?? ""
                    }
                />
                <Button variant="ghost" size="icon" asChild>
                    <Link to="/">
                        <XIcon className="size-6"/>
                    </Link>
                </Button>
            </div>
            <div className="flex w-full flex-col gap-2 overflow-y-auto px-4">
                <div className="relative flex min-w-full flex-col sm:min-w-64">
                    {data.entry.stopTimes.map((t, i) => (
                            <StopTimesEntry
                                key={i}
                                data={t}
                                vehicle={vehicle}
                                stop={data.references?.stops?.[t.stopId]}
                                stopSequence={vehicle.vehicle?.stopSequence}
                            />
                    ))}
                </div>
            </div>
        </div>
    )
}
