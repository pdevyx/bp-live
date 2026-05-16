import { cn } from "@/lib/utils"
import { useTime } from "@/hooks/use-time"
import { format } from "date-fns"

export default function Clock({
    className,
    formatStr = "HH:mm:ss",
    ...props
}: React.ComponentProps<"span"> & { formatStr?: string }) {
    const time = useTime()

    return (
        <span className={cn("text-2xl font-bold select-none", className)} {...props}>
            {format(time, formatStr)}
        </span>
    )
}