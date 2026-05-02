import type { components } from "@/lib/api/v1"
import { cn, formatTimeSeconds, getFormattedStopTimes, type StopTimeEntry } from "@/lib/utils"
import { useMemo } from "react"
import { isBefore, fromUnixTime } from "date-fns"
import { useTime } from "@/hooks/use-time"
import type { StopTimesEntryProps } from "../trips/stop-time-entry"
import StopTime from "../trips/stop-time"

type StopDeparturesEntryProps<T extends StopTimeEntry> = Omit<StopTimesEntryProps, "data"> & {
    data: T
}

export default function StopDeparturesEntry<T extends StopTimeEntry> ({
    data,
    route,
    stop,
    stopSequence,
    className,
    ...props
}: React.ComponentProps<"div"> & StopDeparturesEntryProps<T>) {
    const time = useTime()

    if (!stop) {
        return null
    }

    const entry = useMemo(() => {
        const times = getFormattedStopTimes(data)

        let time = times.arrivalTime

        if (times.departureTime.time !== undefined) {
            time =  times.departureTime
        }

        return time

    }, [
        data.arrivalTime,
        data.departureTime,
        data.predictedArrivalTime,
        data.predictedDepartureTime,
    ])


    const isPrevious = useMemo(() => {
          const isPreviousLive =
            stopSequence !== undefined && data.stopSequence !== undefined
                ? stopSequence > data.stopSequence
                : undefined

        let checkTime = entry?.time

        const isPreviousTime = checkTime
            ? isBefore(fromUnixTime(checkTime), time)
            : undefined

        return isPreviousLive ?? isPreviousTime ?? true
    }, [stopSequence, data, entry, time])

    if (!entry?.time) return null

    return (
        <div
            className={cn(
                className,
                "flex items-center font-noto text-sm"
            )}
        >
            <span className="flex flex-col items-center">
                {entry.time && (
                    <StopTime
                        time={entry.time}
                        predicted={entry.isPredicted}
                        isPrevious={isPrevious}
                        compact={true}
                    />
                )}
            </span>
        </div>
    )
}
