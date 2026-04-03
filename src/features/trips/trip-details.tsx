import { XIcon } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Link } from "@tanstack/react-router";
import type { components } from "@/lib/api/v1";
import { cn, vehicleFromTripResponse } from "@/lib/utils";
import StopTimesEntry from "./stop-time-entry";
import { useMemo } from "react";
import VehicleSummary from "../vehicles/vehicle-summary";

export default function TripDetails({ data }: {
    data: components["schemas"]["TransitEntryWithReferencesTransitTripDetailsOTP"]
}) {

    const vehicle = useMemo(() => vehicleFromTripResponse(data), [data])

    return (
        <div className="absolute flex items-center left-2 top-0 bottom-0 z-10 my-2 pointer-none">
            <div className="flex flex-col items-center gap-2 py-4 bg-background/90 rounded-xl">
                <div className="flex justify-between items-center w-full gap-2 px-4">

                    <h2 className="text-lg font-bold">Trip details</h2>
                    <Button variant="ghost" size="icon" asChild>
                        <Link to="/">
                            <XIcon />
                        </Link>
                    </Button>
                </div>
                <div className="flex flex-col gap-2 overflow-y-auto px-4">
                    <VehicleSummary route={vehicle.route} headsign={vehicle.headsign ?? vehicle.trip.tripHeadsign ?? ""} />
                    <div className="flex flex-col relative mx-none max-h-160">
                        {data.entry.stopTimes.map((t, i) => (
                            <div className={cn("flex items-start font-md gap-2 font-noto text-sm relative py-2 px-1 first:[&>span:first-of-type]:mt-2 last:[&>span:first-of-type]:h-1")}>
                                <span
                                    className={cn(
                                        "absolute h-full w-1 ms-2 top-2 bottom-10 left-0 right-0",
                                    )}
                                    style={{
                                        "backgroundColor": `#${vehicle?.route?.style.color ?? "222222"}`
                                    }}
                                />
                                <span
                                    className="w-3 h-3 rounded-full border-2 z-10 bg-background mt-1"
                                    style={{
                                        "borderColor": `#${vehicle?.route?.style.color ?? "222222"}`
                                    }}
                                />

                                <StopTimesEntry key={i} data={t} stop={data.references?.stops?.[t.stopId]} stopSequence={vehicle.vehicle?.stopSequence} />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}