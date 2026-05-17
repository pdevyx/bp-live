import type { components } from "@/lib/api/v1"
import { cn, formatTimeSeconds, getFormattedStopTimes, isPreviousStop } from "@/lib/utils"
import { useMemo } from "react"
import StopTime from "./stop-time"
import { isBefore, fromUnixTime } from "date-fns"
import { useTime } from "@/hooks/use-time"
import { cva, type VariantProps } from "class-variance-authority"

export type TripStopTimes =
    components["schemas"]["TransitEntryWithReferencesTransitTripDetailsOTP"]["entry"]["stopTimes"][number]

export type StopTimesEntryProps = {
    data: TripStopTimes
    route: components["schemas"]["TransitRoute"] | undefined
    stop: components["schemas"]["TransitStop"] | undefined
    stopSequence: number | undefined
    showTimes?: boolean
    showPlatform?: boolean
    showPrevious?: boolean
}

export type StopTime = {
    time: number | undefined
    isPredicted: boolean
}

export type FormattedStopTimes = {
    arrivalTime: StopTime
    departureTime: StopTime
}

const lineVariants = cva("absolute bg-ring z-2", {
    variants: {
        size: {
            default: "top-4 right-0 bottom-0 left-0 ms-2 h-full w-1",
            lg: "top-4 right-0 bottom-0 left-0 ms-2.5 h-full w-3",
        },
    },
    defaultVariants: {
        size: "default",
    },
})

const lineCircleVariants = cva("border-ring bg-background z-2", {
    variants: {
        size: {
            default: "z-10 mt-1 h-3 w-3 rounded-full border-2",
            lg: "z-10 mt-1 h-6 w-6 rounded-full border-4",
        },
    },
    defaultVariants: {
        size: "default",
    },
})

const divVariants = cva("font-md relative flex items-start font-noto", {
    variants: {
        size: {
            default: "text-sm gap-2 px-1 py-2 first:[&>span:first-of-type]:mt-2 last:[&>span:first-of-type]:h-1",
            lg: "text-2xl text-white! gap-2 px-1 py-2 last:[&>span:first-of-type]:h-1",
        },
    },
    defaultVariants: {
        size: "default",
    },
})

export default function StopTimesEntry({
    data,
    route,
    stop,
    stopSequence,
    className,
    showTimes = true,
    showPlatform = true,
    showPrevious = true,
    size = "default",
    ...props
}: React.ComponentProps<"div"> &
    VariantProps<typeof lineVariants> &
    StopTimesEntryProps) {
    const time = useTime()

    if (!stop) {
        return null
    }

    const isPrevious = isPreviousStop(data, stopSequence, time)

    const times = useMemo(() => {
        return getFormattedStopTimes(data)
    }, [
        data.arrivalTime,
        data.departureTime,
        data.predictedArrivalTime,
        data.predictedDepartureTime,
    ])

    if (!showPrevious && isPrevious) {
        return null
    }

    return (
        <div
            className={cn(
                className,
                divVariants({ size }),
            )}
            {...props}
            data-previous={isPrevious}
        >
            <span
                className={lineVariants({ size })}
                style={{
                    backgroundColor: isPrevious
                        ? undefined
                        : `#${route?.style.color ?? "222222"}`,
                }}
            />
            <span
                className={lineCircleVariants({ size })}
                style={{
                    borderColor: isPrevious
                        ? undefined
                        : `#${route?.style.color ?? "222222"}`,
                }}
            />

            {showTimes && (
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
            )}

            <span
                className={cn(
                    "col-span-2 flex items-center gap-1",
                    isPrevious && "text-ring"
                )}
            >
                {stop.name}{" "}
                {showPlatform && stop.platformCode && (
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
