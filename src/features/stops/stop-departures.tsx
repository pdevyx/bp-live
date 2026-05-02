import { Separator } from "@/components/ui/separator"
import useStopDepartures from "@/hooks/use-stop-departures"
import VehicleSummary from "../vehicles/vehicle-summary"
import StopDeparturesEntry from "./stop-departure-entry"
import { Loader2 } from "lucide-react"

type StopDeparturesProps = {
    stopId: string
}

export default function StopDepartures({ stopId }: StopDeparturesProps) {
    const { stop, isLoading } = useStopDepartures(stopId)

    return (
        <div className="flex flex-col gap-2">
            <Separator />

            <div className="flex max-h-40 min-h-40 flex-col gap-4 overflow-y-auto">
                {stop && stop.stopTimes.length > 0 ? (
                    stop.stopTimes.map((st, i) => (
                        <div key={i}>
                            <div className="flex items-center justify-between gap-4 pe-1">
                                <VehicleSummary
                                    size="xs"
                                    route={st.route}
                                    headsign={st.stopHeadsign}
                                />

                                <StopDeparturesEntry
                                    key={i}
                                    data={st}
                                    route={st.route}
                                    stop={stop}
                                    stopSequence={st.vehicle?.stopSequence}
                                    className="flex"
                                />
                            </div>
                        </div>
                    ))
                ) : (
                    
                    <div className="m-auto text-center">
                        {
                            isLoading ? (
                                <div className="flex flex-col justify-center gap-2">
                                    <span>Loading departures</span>
                                    <Loader2 className="m-auto animate-spin" />
                                </div>
                            ) : (
                              
                            <span>No departures within the next 30 minutes.</span>
                            )
                        }    
                    </div>
                )}
            </div>

        </div>
    )
}
