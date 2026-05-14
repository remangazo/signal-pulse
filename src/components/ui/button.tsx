"use client"

import { forwardRef, type ButtonHTMLAttributes } from "react"
import { cn } from "@/lib/utils"

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost"
  size?: "sm" | "md" | "lg"
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "relative inline-flex items-center justify-center font-medium transition-all duration-200 ease-out cursor-pointer select-none",
          "active:scale-[0.97]",
          {
            "text-deep bg-signal hover:bg-signal-dark shadow-lg shadow-signal/20 active:shadow-md":
              variant === "primary",
            "text-foreground border border-border bg-surface hover:bg-surface-hover active:bg-surface":
              variant === "secondary",
            "text-muted hover:text-foreground hover:bg-surface/50":
              variant === "ghost",
          },
          {
            "px-4 py-1.5 text-sm rounded-md": size === "sm",
            "px-6 py-2.5 text-base rounded-lg": size === "md",
            "px-8 py-3 text-lg rounded-lg": size === "lg",
          },
          className
        )}
        {...props}
      >
        {children}
      </button>
    )
  }
)
Button.displayName = "Button"

export { Button }
