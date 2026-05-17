import { X } from "lucide-react"
import { Button } from "../../components/ui/button"
import type { TripDetailsResponse, OptionalVehicle } from "@/lib/types"
import VehicleSummary from "../vehicles/vehicle-summary"
import StopTimesEntry from "../trips/stop-time-entry"
import BKK from "@/assets/icons/bkk.svg?react"
import Clock from "@/components/clock"
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogTrigger,
} from "@/components/ui/dialog"
import { fromUnixTime, isBefore } from "date-fns"
import { useTime } from "@/hooks/use-time"
import { isPreviousStop } from "@/lib/utils"

export default function TripDisplay({
    data,
    vehicle,
    children,
}: {
    data: TripDetailsResponse
    vehicle: OptionalVehicle
    children: React.ReactNode
}) {
    const time = useTime()

    const nextStopCount = data.entry.stopTimes
        .map((t) => isPreviousStop(t, vehicle.vehicle?.stopSequence, time))
        .filter((isPrevious) => !isPrevious).length

    return (
        <Dialog>
            <DialogTrigger>{children}</DialogTrigger>
            <DialogContent
                className="min-w-4xl gap-2 border-0 bg-transparent ring-0"
                showCloseButton={false}
            >
                <div className="flex w-full items-center justify-between">
                    <span className="font-noto text-lg">Simulated display</span>
                    <DialogClose asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="cursor-pointer bg-transparent!"
                            aria-description="Close"
                            title="Close display"
                        >
                            <X className="size-8" />
                        </Button>
                    </DialogClose>
                </div>
                <div className="flex max-h-full max-w-full flex-col gap-0 overflow-hidden rounded-sm border-16 border-black border-b-stone-400 p-0 dark:border-gray-800 dark:border-b-stone-400">
                    <div className="bg-[#5b6fa5] px-2 text-white">
                        <div className="flex w-full items-center justify-between gap-4">
                            {vehicle.route ? (
                                <VehicleSummary
                                    route={vehicle.route}
                                    headsign={
                                        vehicle.headsign ??
                                        vehicle.trip?.tripHeadsign ??
                                        ""
                                    }
                                    className="gap-2"
                                    icon={[
                                        "SUBWAY",
                                        "SUBURBAN_RAILWAY",
                                    ].includes(vehicle.route.type)}
                                    size="xl"
                                />
                            ) : (
                                <span className="text-xl font-bold">
                                    No route available.
                                </span>
                            )}
                            <div className="flex flex-col items-center">
                                <Clock
                                    className="font-noto text-xl"
                                    formatStr="HH:mm"
                                />
                                <BKK height={25} width={40} />
                            </div>
                        </div>
                    </div>

                    <div className="relative flex min-h-50 w-full flex-col justify-end gap-2 overflow-hidden bg-[#34417e]">
                        {nextStopCount > 0 && (
                            <>
                                <span
                                    className="absolute top-0 right-0 bottom-0 left-0 z-2 ms-24.5 h-45 w-3 bg-ring"
                                    style={{
                                        backgroundColor: `#${vehicle?.route?.style.color ?? "222222"}`,
                                    }}
                                />
                                <div className="absolute top-0 right-0 bottom-0 left-0 ms-24.5 flex">
                                    <span className="absolute z-50 mt-1 h-1 w-3 bg-[#34417e]" />
                                    <span className="absolute z-50 mt-3 h-1 w-3 bg-[#34417e]" />
                                </div>
                            </>
                        )}

                        <div className="relative flex max-h-50 max-w-full min-w-full flex-col justify-end overflow-hidden sm:min-w-64">
                            {data.entry.stopTimes.slice(1).toReversed().map((t, i) => (
                                <StopTimesEntry
                                    key={i}
                                    data={t}
                                    route={vehicle.route}
                                    stop={data.references?.stops?.find(
                                        (s) => s.id === t.stopId
                                    )}
                                    stopSequence={vehicle.vehicle?.stopSequence}
                                    showTimes={false}
                                    showPlatform={false}
                                    showPrevious={false}
                                    size="lg"
                                    className="ps-23 last:bg-[#5b6fa5] last:font-bold [&>span:first-of-type]:ms-24.5 first:[&>span:first-of-type]:-mt-8! [&>span:nth-of-type(2)]:bg-white"
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
