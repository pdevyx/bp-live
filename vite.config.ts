import { defineConfig } from "vite"
import tanstackRouter from "@tanstack/router-plugin/vite"
import viteTsConfigPaths from "vite-tsconfig-paths"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import svgr from "vite-plugin-svgr"

const config = defineConfig({
    plugins: [
        tanstackRouter({ target: "react", autoCodeSplitting: true }),
        // this is the plugin that enables path aliases
        viteTsConfigPaths({
            projects: ["./tsconfig.json"],
        }),
        tailwindcss(),
        react(),
        svgr(),
    ],
    base: "/bp-live/",
})

export default config
