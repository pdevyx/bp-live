import type { components } from "@/lib/api/v1"
import { cn, formatTime } from "@/lib/utils"
import { useMemo } from "react"
import StopTime from "./stop-time"

export type TripStopTimes =
    components["schemas"]["TransitEntryWithReferencesTransitTripDetailsOTP"]["entry"]["stopTimes"][number]

export type StopTimesEntryProps = {
    data: TripStopTimes
    stop: components["schemas"]["TransitStop"]
    stopSequence: number | undefined
}

export type StopTimeFormattedValues = {
    arrivalTime: string | undefined
    departureTime: string | undefined
    predictedArrivalTime: string | undefined
    predictedDepartureTime: string | undefined
    isPrevious: boolean
}

export default function StopTimesEntry({
    data,
    stop,
    stopSequence,
}: StopTimesEntryProps) {
    const times = useMemo(() => {
        return {
            arrivalTime: formatTime(data.arrivalTime),
            departureTime: formatTime(data.departureTime),
            predictedArrivalTime: formatTime(data.predictedArrivalTime),
            predictedDepartureTime: formatTime(data.predictedDepartureTime),
            isPrevious:
                stopSequence !== undefined && data.stopSequence !== undefined
                    ? stopSequence > data.stopSequence
                    : true,
        } satisfies StopTimeFormattedValues
    }, [data])

    return (
        <>
            <span className="flex flex-col items-center">
                {times.predictedArrivalTime !== undefined ? (
                    <StopTime
                        value={times.predictedArrivalTime}
                        predicted={true}
                        isPrevious={times.isPrevious}
                    />
                ) : (
                    <StopTime
                        value={times.arrivalTime ?? ""}
                        predicted={false}
                        isPrevious={times.isPrevious}
                    />
                )}
                {times.arrivalTime !== times.departureTime &&
                    times.predictedArrivalTime !==
                        times.predictedDepartureTime &&
                    (times.predictedDepartureTime !== undefined ? (
                        <StopTime
                            value={times.predictedDepartureTime}
                            predicted={true}
                            isPrevious={times.isPrevious}
                        />
                    ) : (
                        <StopTime
                            value={times.departureTime ?? ""}
                            predicted={false}
                            isPrevious={times.isPrevious}
                        />
                    ))}
            </span>
            <span
                className={cn(
                    "col-span-2 flex items-center gap-1",
                    times.isPrevious && "text-ring"
                )}
            >
                {stop.name}{" "}
                {stop.platformCode && (
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-orange-500 text-xs text-white">
                        <span className="pt-px font-mono leading-none">
                            {stop.platformCode}
                        </span>
                    </div>
                )}
            </span>
        </>
    )
}
