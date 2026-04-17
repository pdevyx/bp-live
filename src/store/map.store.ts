import { create } from "zustand"
import type { BoundingBox } from "@/lib/types"

interface MapState {
    bounds: BoundingBox | null
    setBounds: (bounds: BoundingBox) => void
}

export const useMapStore = create<MapState>((set) => ({
    bounds: null,
    setBounds: (bounds) => set({ bounds }),
}))
