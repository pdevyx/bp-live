import { cn } from "@/lib/utils"

export default function Logo({
    className,
    ...props
}: React.ComponentProps<"div">) {
    return (
        <div
            className={cn(
                "mx-auto flex items-center gap-1 font-sans text-bkk-purple",
                className
            )}
            {...props}
        >
            <span className="text-2xl">Budapest</span>
            <span className="rounded bg-bkk-purple/90 px-1 text-base font-bold text-white">
                LIVE
            </span>
        </div>
    )
}
