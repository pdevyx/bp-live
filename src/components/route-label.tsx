import type React from "react";

export default function RouteLabel({
    text,
    color,
    ...props
}: React.ComponentProps<"div"> & { text: string, color: Pick<React.CSSProperties, "backgroundColor" | "color"> }) {
    return (
        <div className="flex flex-col justify-center rounded w-12 h-6" style={{ "backgroundColor": color.backgroundColor }}>
            <span className="text text-center font-semibold p-0 m-0 font-noto" style={{ "color": color.color }}>
                {text}
            </span>
        </div>
    )
}