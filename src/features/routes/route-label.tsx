import type { components } from "@/lib/api/v1"
import { cn } from "@/lib/utils"
import { cva, type VariantProps } from "class-variance-authority"
import type React from "react"

const boxVariants = cva("flex flex-col items-center justify-center shrink-0", {
    variants: {
        size: {
            default: "h-7 w-14 rounded text-base",
            sm: "h-6 w-12 rounded text-sm",
            xs: "h-5 w-10 rounded text-xs",
        },
    },
    defaultVariants: {
        size: "default",
    },
})

const circleVariants = cva("flex flex-col items-center justify-center shrink-0", {
    variants: {
        size: {
            default: "h-7 w-7 rounded-full text-base",
            sm: "h-6 w-6 rounded-full text-sm",
            xs: "h-5 w-5 rounded-full text-xs",
        },
    },
    defaultVariants: {
        size: "default",
    },
})

export default function RouteLabel({
    text,
    color,
    type,
    size = "default",
    className,
    ...props
}: React.ComponentProps<"div"> &
    VariantProps<typeof boxVariants> & {
        asChild?: boolean
        text: string
        color: Pick<React.CSSProperties, "backgroundColor" | "color">
        type: components["schemas"]["TransitRouteStyleIconType"]
    }) {
    const variant =
        type === "CIRCLE" ? circleVariants({ size }) : boxVariants({ size })

    return (
        <div
            className={cn(variant, className)}
            style={{ backgroundColor: color.backgroundColor }}
            {...props}
        >
            <span
                className="m-0 p-0 text-center font-noto font-bold"
                style={{ color: color.color }}
            >
                {text}
            </span>
        </div>
    )
}
