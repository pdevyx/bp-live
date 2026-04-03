import type { components } from "@/lib/api/v1";
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import type React from "react";


const boxVariants = cva(
    "flex flex-col justify-center items-center",
    {
        variants: {
            size: {
                default: "w-14 h-7 text-base rounded",
                sm: "w-12 h-6 text-sm rounded",
                xs: "w-10 h-5 text-xs rounded"
            },
        },
        defaultVariants: {
            size: "default",
        },
    }
)


const circleVariants = cva(
    "flex flex-col justify-center items-center",
    {
        variants: {
            size: {
                default: "w-7 h-7 text-base rounded-full",
                sm: "w-6 h-6 text-sm rounded-full",
                xs: "w-5 h-5 text-xs rounded-full"
            },
        },
        defaultVariants: {
            size: "default",
        },
    }
)

export default function RouteLabel({
    text,
    color,
    type,
    size = "default",
    className,
    ...props
}: React.ComponentProps<"div"> &
    VariantProps<typeof boxVariants> & {
        asChild?: boolean,
        text: string, color: Pick<React.CSSProperties, "backgroundColor" | "color">,
        type: components["schemas"]["TransitRouteStyleIconType"]
    }) {

    const variant = type === "CIRCLE" ? circleVariants({ size }) : boxVariants({ size })

    return (

        <div className={cn(variant, className)} style={{ "backgroundColor": color.backgroundColor }} {...props}>
            <span className="text-center font-bold p-0 m-0 font-noto" style={{ "color": color.color }}>
                {text}
            </span>
        </div>
    )
}