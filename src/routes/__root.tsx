import { Outlet, createRootRoute } from "@tanstack/react-router"
import { QueryClientProvider } from "@tanstack/react-query"
import { ThemeProvider } from "@/providers/theme-provider"
import { Map, MapControls } from "@/components/ui/map"
import { ModeToggle } from "@/components/layout/mode-toggle"
import { useMapBoundsSync } from "@/components/layout/use-map-bounds-sync"
import { queryClient } from "@/lib/client"
import Clock from "@/components/clock"
import Logo from "@/components/logo"
import Loading from "@/components/loading"

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
                    <div className="absolute z-50 w-full p-2 pointer-events-none">
                        <div className="relative flex items-center justify-center sm:justify-between gap-2 rounded-xl">
                            <div className="sm:flex items-center gap-4 hidden rounded-xl py-2 px-3 bg-card pointer-events-auto">
                                <Logo />
                            </div>
                            <div className="flex items-center gap-4 rounded-xl py-2 px-3 bg-card pointer-events-auto">
                                <div className="flex items-center gap-4">
                                    <Clock className="hidden sm:block"/>
                                    <Logo className="sm:hidden"/>
                                    <ModeToggle />
                                </div>
                            </div>
                        </div>
                    </div>

                    <Map
                        center={[19.0551266, 47.4985022]}
                        zoom={15}
                        className="grow"
                        attributionControl={{
                            customAttribution: "Data: BKK Zrt., CC BY 4.0",
                            compact: true,
                        }}
                        minZoom={6}
                    >
                        <MapControls showLocate={true} showCompass={true} />
                        <AppMap />
                        <Loading />
                    </Map>
                </div>
            </ThemeProvider>

            {/* <TanStackRouterDevtools position="bottom-right" /> */}
        </QueryClientProvider>
    )
}
