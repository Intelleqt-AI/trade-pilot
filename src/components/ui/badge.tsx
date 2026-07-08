import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-md border border-transparent font-semibold transition-colors",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground",
        secondary: "bg-secondary text-secondary-foreground",
        destructive: "bg-destructive text-destructive-foreground",
        outline: "border-border text-foreground",
      },
      tone: {
        neutral: "",
        brand: "",
        success: "",
        warning: "",
        danger: "",
        info: "",
        accent: "",
        violet: "",
      },
      fill: {
        soft: "",
        solid: "",
      },
      size: {
        sm: "h-[18px] px-1.5 text-[11px]",
        md: "h-[22px] px-2 text-xs",
        lg: "h-[26px] px-2.5 text-[13px]",
      },
    },
    compoundVariants: [
      { tone: "neutral", fill: "soft", class: "bg-gray-100 text-gray-600" },
      { tone: "neutral", fill: "solid", class: "bg-gray-500 text-white" },
      { tone: "brand", fill: "soft", class: "bg-teal-50 text-teal-700" },
      { tone: "brand", fill: "solid", class: "bg-teal-500 text-white" },
      { tone: "success", fill: "soft", class: "bg-green-50 text-green-600" },
      { tone: "success", fill: "solid", class: "bg-green-500 text-white" },
      { tone: "warning", fill: "soft", class: "bg-amber-50 text-amber-600" },
      { tone: "warning", fill: "solid", class: "bg-amber-500 text-white" },
      { tone: "danger", fill: "soft", class: "bg-red-50 text-red-600" },
      { tone: "danger", fill: "solid", class: "bg-red-500 text-white" },
      { tone: "info", fill: "soft", class: "bg-blue-50 text-blue-600" },
      { tone: "info", fill: "solid", class: "bg-blue-500 text-white" },
      { tone: "accent", fill: "soft", class: "bg-orange-50 text-orange-600" },
      { tone: "accent", fill: "solid", class: "bg-orange-500 text-white" },
      { tone: "violet", fill: "soft", class: "bg-violet-50 text-violet-600" },
      { tone: "violet", fill: "solid", class: "bg-violet-500 text-white" },
    ],
    defaultVariants: {
      fill: "soft",
      size: "md",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  /** Renders a small leading status dot in the tone colour */
  dot?: boolean
}

function Badge({ className, variant, tone, fill, size, dot, ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        badgeVariants({
          variant: tone ? undefined : variant ?? "default",
          tone,
          fill,
          size,
        }),
        className
      )}
      {...props}
    >
      {dot && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-current" />}
      {props.children}
    </div>
  )
}

export { Badge, badgeVariants }
