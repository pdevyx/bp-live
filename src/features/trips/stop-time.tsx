import { cn, formatTimeSeconds, formatTimeUntil } from "@/lib/utils"

export type StopTimeProps = {
    time: number
    predicted: boolean
    isPrevious: boolean
    compact?: boolean
}

export default function StopTime({
    time,
    predicted,
    isPrevious,
    compact = false
}: StopTimeProps) {
    const value = compact ? formatTimeUntil(time) : formatTimeSeconds(time)

    if (!value) return null

    return (
        <span
            className={cn(
                "font-bold",
                isPrevious ? "text-ring" : predicted && "text-success"
            )}
        >
            {value}
        </span>
    )
}
