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
                    <div className="absolute z-50 w-full border-b bg-card p-4">
                        <div className="relative flex items-center justify-between gap-2">
                            <div></div>
                            <div className="pointer-events-none absolute right-0 left-0 flex">
                                <Logo />
                            </div>
                            <div className="flex items-center gap-4 rounded-xl">
                                <div className="flex items-center gap-2">
                                    <ModeToggle />
                                </div>
                                <Clock className="hidden sm:block" />
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
