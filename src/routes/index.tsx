import { createFileRoute } from "@tanstack/react-router"
import { Map, MapControls } from "@/components/ui/map"
import { ModeToggle } from "@/components/mode-toggle"
import Locations from "@/components/locations"

export const Route = createFileRoute("/")({ component: App })

function App() {

  return (
    <div className="relative flex flex-col min-h-svh w-full   ">
      <div className="absolute flex items-center z-10 my-2 w-full pointer-none">
        <div className="bg- flex items-center p-4 bg-background/90 rounded-xl gap-16 mx-auto">
          <div className="flex items-center text-bkk-purple">
            <span>Budapest<span className="font-bold">LIVE</span></span>
          </div>
          <div className="flex items-center gap-2">
          {/*   <span>Menü 1</span>
            <span>Menü 2</span> */}
            <ModeToggle />
          </div>
        </div>
      </div>
      <Map center={[19.0551266, 47.4985022]} zoom={11} className="grow" >
        <MapControls showLocate={true} showCompass={true} />
        <Locations/>
      </Map>
    </div>
  )
}
