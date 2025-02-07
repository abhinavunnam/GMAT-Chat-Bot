import * as React from "react"
import { useTheme } from "../theme-provider"
import { cn } from "@/lib/utils"

const Input = React.forwardRef(({ className, type, ...props }, ref) => {
  const { theme } = useTheme()
  const isDark = theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches)

  return (
    <input
      type={type}
      className={cn(
        "flex h-10 w-full rounded-md px-3 py-2 text-base",
        "file:border-0 file:bg-transparent file:text-sm file:font-medium",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "md:text-sm",
        isDark
          ? cn(
              "border-neutral-800 bg-neutral-950 ring-offset-neutral-950",
              "file:text-neutral-50 placeholder:text-neutral-400",
              "focus-visible:ring-neutral-300"
            )
          : cn(
              "border-neutral-200 bg-white ring-offset-white",
              "file:text-neutral-950 placeholder:text-neutral-500",
              "focus-visible:ring-neutral-950"
            ),
        className
      )}
      ref={ref}
      {...props}
    />
  )
})
Input.displayName = "Input"

export { Input }