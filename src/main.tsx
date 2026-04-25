import React from "react"
import ReactDOM from "react-dom/client"
import { RouterProvider, createMemoryHistory, createRouter } from "@tanstack/react-router"
import { routeTree } from "./routeTree.gen"
import "./styles.css"

const memoryHistory = createMemoryHistory({
  initialEntries: ['/'],
})

const router = createRouter({
    routeTree,
    defaultPreload: "intent",
    defaultPreloadStaleTime: 0,
    basepath: "/bp-live/",
    history: memoryHistory
})

declare module "@tanstack/react-router" {
    interface Register {
        router: typeof router
    }
}

const rootElement = document.getElementById("root")!
if (!rootElement.innerHTML) {
    const root = ReactDOM.createRoot(rootElement)
    root.render(
        <React.StrictMode>
            <RouterProvider router={router} />
        </React.StrictMode>
    )
}
