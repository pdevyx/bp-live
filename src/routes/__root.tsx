import { Link, Outlet, createRootRoute } from "@tanstack/react-router"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ThemeProvider } from "@/providers/theme-provider"
import { Map, MapControls } from "@/components/ui/map"
import { ModeToggle } from "@/components/layout/mode-toggle"
import { useMapBoundsSync } from "@/components/layout/use-map-bounds-sync"
import { queryClient } from "@/lib/client"

export const Route = createRootRoute({
    component: RootComponent,
})

function AppMap() {
    useMapBoundsSync()

    return <Outlet />
}

function RootComponent() {
    return (
        <QueryClientProvider client={queryClient}>
            <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
                <div className="relative flex min-h-svh w-full flex-col">
                    <div className="pointer-events-none absolute z-10 my-2 flex w-full justify-center">
                        <div className="pointer-events-auto flex items-center gap-16 rounded-xl bg-background/90 p-4">
                            <div className="flex items-center text-bkk-purple">
                                <span>
                                    Budapest
                                    <span className="font-bold">LIVE</span>
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <ModeToggle />
                            </div>
                        </div>
                    </div>
                    <Map
                        center={[19.0551266, 47.4985022]}
                        zoom={15}
                        className="grow"
                        attributionControl={{
                            customAttribution: "Adatok forrása: BKK Zrt., CC BY 4.0",
                            compact: true,
                        }}
                    >
                        <MapControls showLocate={true} showCompass={true} />
                        <AppMap />
                    </Map>
                </div>
            </ThemeProvider>

            {/* <TanStackRouterDevtools position="bottom-right" /> */}
        </QueryClientProvider>
    )
}
