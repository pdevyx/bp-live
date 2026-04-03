import { Link, Outlet, createRootRoute } from "@tanstack/react-router"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ThemeProvider } from "@/providers/theme-provider"
import createFetchClient from "openapi-fetch";
import createClient from "openapi-react-query";
import type { paths } from "@/lib/api/v1"
import { TanStackRouterDevtools } from "node_modules/@tanstack/react-router-devtools/dist/esm/TanStackRouterDevtools"
import { Button } from "@/components/ui/button";
import { Map, MapControls } from "@/components/ui/map"
import { ModeToggle } from "@/components/layout/mode-toggle";
import { LayerContextProvider } from "@/providers/context";

const queryClient = new QueryClient()

const fetchClient = createFetchClient<paths>({
  baseUrl: "https://futar.bkk.hu/api/query/v1/ws",
});

export const $api = createClient(fetchClient);

export const Route = createRootRoute({
  component: RootComponent,
})

function RootComponent() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <div className="relative flex flex-col min-h-svh w-full">
          <div className="absolute flex justify-center z-10 my-2 pointer-events-none w-full">
            <div className="flex items-center p-4 bg-background/90 rounded-xl gap-16 pointer-events-auto">
              <div className="flex items-center text-bkk-purple">
                <span>Budapest<span className="font-bold">LIVE</span></span>

                
              </div>
              <div className="flex flex-row justify-between gap-2">

                  <Link to="/$"><span>Home</span></Link>
                  <Link to="/stops"><span>Stops</span></Link>
                </div>
              <div className="flex items-center gap-2">
                <ModeToggle />
              </div>
            </div>
          </div>
          <Map center={[19.0551266, 47.4985022]} zoom={15} className="grow" >
            <MapControls showLocate={true} showCompass={true} />
            <LayerContextProvider>
              <Outlet />
            </LayerContextProvider>
          </Map>
        </div>

      </ThemeProvider>

      {/* <TanStackRouterDevtools position="bottom-right" /> */}
    </QueryClientProvider>
  )
}

