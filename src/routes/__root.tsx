import { Outlet, createRootRoute } from "@tanstack/react-router"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ThemeProvider } from "@/components/theme-provider"
import createFetchClient from "openapi-fetch";
import createClient from "openapi-react-query";
import type { paths } from "@/lib/api/v1"
import { TanStackRouterDevtools } from "node_modules/@tanstack/react-router-devtools/dist/esm/TanStackRouterDevtools"

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
        <Outlet />
      </ThemeProvider>

       {/* <TanStackRouterDevtools position="bottom-right" /> */}
    </QueryClientProvider>
  )
}

