import { cn } from "@/lib/utils";


export type StopTimeProps = {
    value: string,
    predicted: boolean,
    isPrevious: boolean
}

export default function StopTime({
    value,
    predicted,
    isPrevious
}: StopTimeProps) {

    return (
        <span className={cn("font-bold", isPrevious ? "text-ring" : (predicted && "text-success"))}>
            {value}
        </span>
    )
}