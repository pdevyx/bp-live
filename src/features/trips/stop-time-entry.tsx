import type { components } from "@/lib/api/v1"
import { cn, formatTime } from "@/lib/utils"
import { useMemo } from "react"
import StopTime from "./stop-time"
import type { Vehicle } from "@/lib/types"
import { isBefore, fromUnixTime } from "date-fns"
import { useTime } from "@/hooks/use-time"

export type TripStopTimes =
    components["schemas"]["TransitEntryWithReferencesTransitTripDetailsOTP"]["entry"]["stopTimes"][number]

export type StopTimesEntryProps = {
    data: TripStopTimes
    vehicle: Vehicle
    stop: components["schemas"]["TransitStop"]
    stopSequence: number | undefined
}

export type StopTime = {
    time: string | undefined
    isPredicted: boolean
}

export type FormattedStopTimes = {
    arrivalTime: StopTime
    departureTime: StopTime
}

export default function StopTimesEntry({
    data,
    vehicle,
    stop,
    stopSequence,
}: StopTimesEntryProps) {
    const time = useTime()

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

        const isPreviousTime = checkTime ? isBefore(fromUnixTime(checkTime), time) : undefined

        return isPreviousLive ?? isPreviousTime ?? true
    }, [stopSequence, data, time])

    const times = useMemo(() => {
        const arrivalTime = formatTime(data.arrivalTime)
        const departureTime = formatTime(data.departureTime)
        const predictedArrivalTime = formatTime(data.predictedArrivalTime)
        const predictedDepartureTime = formatTime(data.predictedDepartureTime)

        return {
            arrivalTime:
                predictedArrivalTime !== undefined
                    ? {
                          time: predictedArrivalTime,
                          isPredicted: true,
                      }
                    : {
                          time: arrivalTime,
                          isPredicted: false,
                      },
            departureTime:
                predictedDepartureTime !== undefined
                    ? {
                          time: predictedDepartureTime,
                          isPredicted: true,
                      }
                    : {
                          time: departureTime,
                          isPredicted: false,
                      },
        } satisfies FormattedStopTimes
    }, [
        data.arrivalTime,
        data.departureTime,
        data.predictedArrivalTime,
        data.predictedDepartureTime,
    ])

    return (
        <div className="font-md relative flex items-start gap-2 px-1 py-2 font-noto text-sm first:[&>span:first-of-type]:mt-2 last:[&>span:first-of-type]:h-1">
            <span
                className="absolute top-4 right-0 bottom-0 left-0 ms-2 h-full w-1 bg-ring"
                style={{
                    backgroundColor: isPrevious ? undefined : `#${vehicle?.route?.style.color ?? "222222"}`,
                }}
            />
            <span
                className="z-10 mt-1 h-3 w-3 rounded-full border-2 bg-background border-ring"
                style={{
                    borderColor: isPrevious ? undefined : `#${vehicle?.route?.style.color ?? "222222"}`,
                }}
            />
            <span className="flex flex-col items-center">
                {times.arrivalTime.time !== undefined && (
                    <StopTime
                        value={times.arrivalTime.time}
                        predicted={times.arrivalTime.isPredicted}
                        isPrevious={isPrevious}
                    />
                )}

                {times.departureTime.time !== times.arrivalTime.time &&
                    times.departureTime.time !== undefined && (
                        <StopTime
                            value={times.departureTime.time}
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
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-orange-500 text-xs text-white shrink-0">
                        <span className="pt-px font-mono leading-none">
                            {stop.platformCode}
                        </span>
                    </div>
                )}
            </span>
        </div>
    )
}
