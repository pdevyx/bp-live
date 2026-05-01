import { useEffect, useState } from "react"
import Logo from "./logo"
import { useMap } from "./ui/map"
import { Loader2 } from "lucide-react"

export default function Loading() {
    const { isLoaded, map } = useMap()
    const [hasLoaded, setHasLoaded] = useState(false)

    useEffect(() => {
        if (isLoaded) {
            setHasLoaded(true)
        }
    }, [isLoaded, map])

    if (hasLoaded) return null

    return (
        <div className="absolute top-0 bottom-0 z-100 min-h-svh w-full">
            <div className="relative flex h-full grow flex-col items-center justify-center gap-10 bg-background">
                <Logo />
                <Loader2 className="size-8 animate-spin text-bkk-purple" />
            </div>
        </div>
    )
}
