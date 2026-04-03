import { createFileRoute, Link, useParams } from "@tanstack/react-router"
import { Map, MapControls } from "@/components/ui/map"
import { ModeToggle } from "@/components/layout/mode-toggle"
import { LayerContextProvider } from "@/providers/context"
import VehiclesLayer from "@/features/vehicles"
import StopsLayer from "@/features/stops"
import { useState } from "react"
import { Button } from "@/components/ui/button"

export const Route = createFileRoute("/")({ component: App })

function App() {

  const [on, setOn] = useState(true)

  return (
    <VehiclesLayer />

  )
}
