import { XIcon } from "lucide-react"
import { Button } from "../../components/ui/button"
import { Link } from "@tanstack/react-router"
import type { components } from "@/lib/api/v1"
import { cn, vehicleFromTripResponse } from "@/lib/utils"
import StopTimesEntry from "./stop-time-entry"
import { useMemo } from "react"
import VehicleSummary from "../vehicles/vehicle-summary"

export default function TripDetails({
    data,
}: {
    data: components["schemas"]["TransitEntryWithReferencesTransitTripDetailsOTP"]
}) {
    const vehicle = useMemo(() => vehicleFromTripResponse(data), [data])

    return (
        <div className="pointer-events-none absolute top-0 bottom-0 left-2 z-10 my-2 flex items-center">
            <div className="pointer-events-auto flex flex-col items-center gap-2 rounded-xl bg-background/90 py-4">
                <div className="flex w-full items-center justify-between gap-2 px-4">
                    <h2 className="text-lg font-bold">Trip details</h2>
                    <Button variant="ghost" size="icon" asChild>
                        <Link to="/">
                            <XIcon />
                        </Link>
                    </Button>
                </div>
                <div className="flex flex-col gap-2 overflow-y-auto px-4">
                    <VehicleSummary
                        route={vehicle.route}
                        headsign={
                            vehicle.headsign ?? vehicle.trip.tripHeadsign ?? ""
                        }
                    />
                    <div className="mx-none relative flex max-h-160 min-w-64 flex-col">
                        {data.entry.stopTimes.map((t, i) => (
                            <div
                                className={cn(
                                    "font-md relative flex items-start gap-2 px-1 py-2 font-noto text-sm first:[&>span:first-of-type]:mt-2 last:[&>span:first-of-type]:h-1"
                                )}
                            >
                                <span
                                    className={cn(
                                        "absolute top-2 right-0 bottom-10 left-0 ms-2 h-full w-1"
                                    )}
                                    style={{
                                        backgroundColor: `#${vehicle?.route?.style.color ?? "222222"}`,
                                    }}
                                />
                                <span
                                    className="z-10 mt-1 h-3 w-3 rounded-full border-2 bg-background"
                                    style={{
                                        borderColor: `#${vehicle?.route?.style.color ?? "222222"}`,
                                    }}
                                />

                                <StopTimesEntry
                                    key={i}
                                    data={t}
                                    stop={data.references?.stops?.[t.stopId]}
                                    stopSequence={vehicle.vehicle?.stopSequence}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
