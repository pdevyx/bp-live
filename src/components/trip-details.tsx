import { XIcon } from "lucide-react";
import { Button } from "./ui/button";
import { Link } from "@tanstack/react-router";
import type { components } from "@/lib/api/v1";
import { fromUnixTime, format } from 'date-fns';
import { cn, vehicleFromTripResponse } from "@/lib/utils";
import { VehicleCard } from "./vehicle-tooltip";

export default function TripDetails({ data }: {
    data: components["schemas"]["TransitEntryWithReferencesTransitTripDetailsOTP"]
}) {
    return (
        <div className="absolute flex items-center left-2 mt-30 z-10 my-2 pointer-none">
            <div className="flex flex-col items-center p-4 bg-background/90 rounded-xl max-h-[40rem]">
                <div className="flex justify-between items-center w-full gap-2">

                    <h2 className="text-lg font-bold">Trip details</h2>
                    <Button variant="ghost" asChild>
                        <Link to="/">
                            <XIcon />
                        </Link>
                    </Button>
                </div>
                <div className="overflow-y-auto gap-2">
                    <VehicleCard vehicleData={vehicleFromTripResponse(data)} />
                    <ul>
                        {data.entry.stopTimes.map((t) => (
                            <li className={cn("flex gap-2 font-md", t.uncertain && "text-orange-600")}>
                                <span>
                                    {t.arrivalTime ? format(fromUnixTime(t.arrivalTime), 'HH:mm') : ""}-{t.departureTime ? format(fromUnixTime(t.departureTime), 'HH:mm') : ""}
                                </span>
                                <span className="font-semibold">
                                    {data.references?.stops?.[t.stopId].name}
                                </span> ({data.references?.stops?.[t.stopId].platformCode}) </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    )
}