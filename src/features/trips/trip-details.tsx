import { CreditCard, XIcon } from "lucide-react"
import { Button } from "../../components/ui/button"
import { Link } from "@tanstack/react-router"
import StopTimesEntry from "./stop-time-entry"
import VehicleSummary from "../vehicles/vehicle-summary"
import type { TripDetailsResponse, OptionalVehicle } from "@/lib/types"
import TripDisplay from "../displays/trip-display"

export default function TripDetails({
    data,
    vehicle,
}: {
    data: TripDetailsResponse
    vehicle: OptionalVehicle
}) {
    return (
        <div className="absolute bottom-0 z-10 flex max-h-1/2 min-h-1/3 w-full flex-col items-center gap-2 rounded-tl-xl rounded-tr-xl bg-card pt-4 sm:w-fit sm:rounded-none sm:rounded-tr-xl lg:top-16 lg:max-h-screen lg:max-w-1/3">
            <div className="flex w-full items-center justify-between gap-2 px-4">
                {vehicle.route ? (
                    <VehicleSummary
                        route={vehicle.route}
                        headsign={
                            vehicle.headsign ?? vehicle.trip?.tripHeadsign ?? ""
                        }
                    />
                ) : (
                    <span className="text-xl font-bold">
                        No route available.
                    </span>
                )}
                <Button variant="ghost" size="icon" asChild>
                    <Link to="/">
                        <XIcon className="size-6" />
                    </Link>
                </Button>
            </div>
            {vehicle.vehicle && (
                <div className="hidden w-full justify-start px-4 lg:flex">
                    <TripDisplay data={data} vehicle={vehicle}>
                        <div className="flex w-full">
                            <Button variant="outline" size="xs">
                                <CreditCard className="size-4" />
                                <span>Display</span>
                            </Button>
                        </div>
                    </TripDisplay>
                </div>
            )}

            <div className="flex w-full flex-col gap-2 overflow-y-auto px-4">
                <div className="relative flex min-w-full flex-col sm:min-w-64">
                    {data.entry.stopTimes.map((t, i) => (
                        <StopTimesEntry
                            key={i}
                            data={t}
                            route={vehicle.route}
                            stop={data.references?.stops?.find(
                                (s) => s.id === t.stopId
                            )}
                            stopSequence={vehicle.vehicle?.stopSequence}
                        />
                    ))}
                </div>
            </div>
        </div>
    )
}
