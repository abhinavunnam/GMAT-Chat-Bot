import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority"
import { useTheme } from "../theme-provider"
import { cn } from "@/lib/utils"

const Button = React.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
  const { theme } = useTheme()
  const isDark = theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches)

  const buttonVariants = cva(
    cn(
      "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
      "disabled:pointer-events-none disabled:opacity-50",
      "[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
      isDark 
        ? "ring-offset-neutral-950 focus-visible:ring-neutral-300" 
        : "ring-offset-white focus-visible:ring-neutral-950"
    ),
    {
      variants: {
        variant: {
          default: cn(
            isDark 
              ? "bg-neutral-50 text-neutral-900 hover:bg-neutral-50/90"
              : "bg-neutral-900 text-neutral-50 hover:bg-neutral-900/90"
          ),
          destructive: cn(
            isDark 
              ? "bg-red-900 text-neutral-50 hover:bg-red-900/90"
              : "bg-red-500 text-neutral-50 hover:bg-red-500/90"
          ),
          outline: cn(
            isDark 
              ? "border border-neutral-800 bg-neutral-950 hover:bg-neutral-800 hover:text-neutral-50"
              : "border border-neutral-200 bg-white hover:bg-neutral-100 hover:text-neutral-900"
          ),
          secondary: cn(
            isDark 
              ? "bg-neutral-800 text-neutral-50 hover:bg-neutral-800/80"
              : "bg-neutral-100 text-neutral-900 hover:bg-neutral-100/80"
          ),
          ghost: cn(
            isDark 
              ? "hover:bg-neutral-800 hover:text-neutral-50"
              : "hover:bg-neutral-100 hover:text-neutral-900"
          ),
          link: cn(
            isDark 
              ? "text-neutral-50 underline-offset-4 hover:underline"
              : "text-neutral-900 underline-offset-4 hover:underline"
          ),
        },
        size: {
          default: "h-10 px-4 py-2",
          sm: "h-9 rounded-md px-3",
          lg: "h-11 rounded-md px-8",
          icon: "h-10 w-10",
        },
      },
      defaultVariants: {
        variant: "default",
        size: "default",
      },
    }
  )

  const Comp = asChild ? Slot : "button"
  return (
    <Comp
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      {...props} 
    />
  )
})
Button.displayName = "Button"

export { Button }