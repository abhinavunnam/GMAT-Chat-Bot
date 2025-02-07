import * as React from "react"
import { cva } from "class-variance-authority"
import { useTheme } from "../theme-provider"
import { cn } from "@/lib/utils"

const Alert = React.forwardRef(({ className, variant = "default", ...props }, ref) => {
  const { theme } = useTheme()
  const isDark = theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches)

  const alertVariants = cva(
    "relative w-full rounded-lg border p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4",
    {
      variants: {
        variant: {
          default: cn(
            isDark 
              ? "border-neutral-800 bg-neutral-950 text-neutral-50 [&>svg]:text-neutral-50" 
              : "border-neutral-200 bg-white text-neutral-950 [&>svg]:text-neutral-950"
          ),
          destructive: cn(
            isDark 
              ? "border-red-900/50 text-red-900 [&>svg]:text-red-900" 
              : "border-red-500/50 text-red-500 [&>svg]:text-red-500"
          ),
        },
      },
      defaultVariants: {
        variant: "default",
      },
    }
  )

  return (
    <div
      ref={ref}
      role="alert"
      className={cn(alertVariants({ variant }), className)}
      {...props} 
    />
  )
})
Alert.displayName = "Alert"

const AlertTitle = React.forwardRef(({ className, ...props }, ref) => (
  <h5
    ref={ref}
    className={cn("mb-1 font-medium leading-none tracking-tight", className)}
    {...props} 
  />
))
AlertTitle.displayName = "AlertTitle"

const AlertDescription = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm [&_p]:leading-relaxed", className)}
    {...props} 
  />
))
AlertDescription.displayName = "AlertDescription"

export { Alert, AlertTitle, AlertDescription }