import type { components } from "@/lib/api/v1"
import { cn, formatTimeSeconds, getFormattedStopTimes } from "@/lib/utils"
import { useMemo } from "react"
import StopTime from "./stop-time"
import { isBefore, fromUnixTime } from "date-fns"
import { useTime } from "@/hooks/use-time"

export type TripStopTimes =
    components["schemas"]["TransitEntryWithReferencesTransitTripDetailsOTP"]["entry"]["stopTimes"][number]

export type StopTimesEntryProps = {
    data: TripStopTimes
    route: components["schemas"]["TransitRoute"] | undefined
    stop: components["schemas"]["TransitStop"] | undefined
    stopSequence: number | undefined
}

export type StopTime = {
    time: number | undefined
    isPredicted: boolean
}

export type FormattedStopTimes = {
    arrivalTime: StopTime
    departureTime: StopTime
}

export default function StopTimesEntry({
    data,
    route,
    stop,
    stopSequence,
    className,
    ...props
}: React.ComponentProps<"div"> & StopTimesEntryProps) {
    const time = useTime()

    if (!stop) {
        return null
    }

    const isPrevious = useMemo(() => {
        const arrival = data.predictedArrivalTime ?? data.arrivalTime
        const departure = data.predictedDepartureTime ?? data.departureTime

        const isPreviousLive =
            stopSequence !== undefined && data.stopSequence !== undefined
                ? stopSequence > data.stopSequence
                : undefined

        let checkTime

        if (arrival !== undefined) {
            checkTime = arrival
        } else if (departure !== undefined) {
            checkTime = departure
        }

        const isPreviousTime = checkTime
            ? isBefore(fromUnixTime(checkTime), time)
            : undefined

        return isPreviousLive ?? isPreviousTime ?? true
    }, [stopSequence, data, time])

    const times = useMemo(() => {
        return getFormattedStopTimes(data)
    }, [
        data.arrivalTime,
        data.departureTime,
        data.predictedArrivalTime,
        data.predictedDepartureTime,
    ])

    return (
        <div
            className={cn(
                className,
                "font-md relative flex items-start gap-2 px-1 py-2 font-noto text-sm first:[&>span:first-of-type]:mt-2 last:[&>span:first-of-type]:h-1"
            )}
            {...props}
        >
            <span
                className="absolute top-4 right-0 bottom-0 left-0 ms-2 h-full w-1 bg-ring"
                style={{
                    backgroundColor: isPrevious
                        ? undefined
                        : `#${route?.style.color ?? "222222"}`,
                }}
            />
            <span
                className="z-10 mt-1 h-3 w-3 rounded-full border-2 border-ring bg-background"
                style={{
                    borderColor: isPrevious
                        ? undefined
                        : `#${route?.style.color ?? "222222"}`,
                }}
            />

            <span className="flex flex-col items-center">
                {times.arrivalTime.time !== undefined && (
                    <StopTime
                        time={times.arrivalTime.time}
                        predicted={times.arrivalTime.isPredicted}
                        isPrevious={isPrevious}
                    />
                )}

                {times.departureTime.time !== times.arrivalTime.time &&
                    times.departureTime.time !== undefined && (
                        <StopTime
                            time={times.departureTime.time}
                            predicted={times.departureTime.isPredicted}
                            isPrevious={isPrevious}
                        />
                    )}
            </span>
            <span
                className={cn(
                    "col-span-2 flex items-center gap-1",
                    isPrevious && "text-ring"
                )}
            >
                {stop.name}{" "}
                {stop.platformCode && (
                    <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-orange-500 text-xs text-white">
                        <span className="pt-px font-mono leading-none">
                            {stop.platformCode}
                        </span>
                    </div>
                )}
            </span>
        </div>
    )
}
