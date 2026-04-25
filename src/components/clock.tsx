import { cn } from "@/lib/utils"
import { useTime } from "@/hooks/use-time"
import { format } from "date-fns"

export default function Clock({
    className,
    ...props
}: React.ComponentProps<"span">) {
    const time = useTime()

    return (
        <span className={cn("text-2xl font-bold select-none", className)} {...props}>
            {format(time, "HH:mm:ss")}
        </span>
    )
}