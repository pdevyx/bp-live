import { createFileRoute, Link, useParams } from "@tanstack/react-router"
import { Map, MapControls } from "@/components/ui/map"
import { ModeToggle } from "@/components/mode-toggle"
import { LayerContextProvider } from "@/components/context"
import VehiclesLayer from "@/components/vehicles"
import StopsLayer from "@/components/stops"
import { useState } from "react"
import { Button } from "@/components/ui/button"

export const Route = createFileRoute("/")({ component: App })

function App() {

  const [on, setOn] = useState(true)

  return (
    <VehiclesLayer />

  )
}
