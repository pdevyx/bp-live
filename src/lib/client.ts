import createFetchClient from "openapi-fetch"
import createClient from "openapi-react-query"
import { QueryClient } from "@tanstack/react-query"
import type { paths } from "@/lib/api/v1"

export const queryClient = new QueryClient()

export const fetchClient = createFetchClient<paths>({
    baseUrl: "https://futar.bkk.hu/api/query/v1/ws",
})

export const $api = createClient(fetchClient)
