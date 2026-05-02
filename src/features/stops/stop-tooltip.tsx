import { Card, CardContent } from "@/components/ui/card";
import RouteList from "../routes/route-list";
import type { MappedStop } from "../../hooks/use-stops";
import StopDepartures from "./stop-departures";

type StopTooltipProps = {
    stop: MappedStop
}

export default function StopTooltip({
    stop
}: StopTooltipProps) {
    return (
        <Card className="max-w-2xs min-w-2xs">
            <CardContent className="flex flex-col gap-2">
                <p className="text-sm font-semibold">{stop.name}</p>

                <RouteList routes={stop.routes} />

                <StopDepartures stopId={stop.id} />
            </CardContent>
        </Card>
    )
}
