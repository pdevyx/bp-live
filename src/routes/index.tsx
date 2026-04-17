import VehiclesLayer from "@/features/vehicles/vehicles"
import { createFileRoute } from "@tanstack/react-router"

import StopsLayer from "@/features/stops/stops"

export const Route = createFileRoute("/")({ component: App })

function App() {
    return (
        <>
            <StopsLayer />
            <VehiclesLayer />
        </>
    )
}
