import { cn } from "@/utils/cn";
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { Spinner } from "@heroui/react";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap text-sm font-bold tracking-wide transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-falla-fire disabled:pointer-events-none disabled:opacity-50 active:translate-x-[1px] active:translate-y-[1px] active:shadow-none gap-2",
  {
    variants: {
      variant: {
        default: "bg-falla-fire text-white ink-border soft-shadow hover:bg-falla-fire/90",
        destructive: "bg-red-500 text-white ink-border soft-shadow hover:bg-red-600",
        outline: "bg-white text-falla-ink ink-border soft-shadow hover:bg-falla-paper",
        secondary: "bg-falla-sage text-white ink-border soft-shadow hover:bg-falla-sage/90",
        ghost: "text-falla-ink hover:bg-falla-ink/5",
        link: "text-falla-fire underline-offset-4 hover:underline",
        neutral: "bg-white text-falla-ink ink-border hover:bg-falla-paper",
      },
      size: {
        default: "h-12 px-6 rounded-xl",
        sm: "h-9 px-4 rounded-lg text-xs",
        lg: "h-14 px-10 rounded-2xl text-base",
        icon: "h-12 w-12 rounded-xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  isLoading?: boolean;
  isIconOnly?: boolean;
  startContent?: React.ReactNode;
  endContent?: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, isLoading, isIconOnly, startContent, endContent, children, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }), isIconOnly && "px-0")}
        ref={ref}
        disabled={isLoading || props.disabled}
        {...props}
      >
        {isLoading ? <Spinner size="sm" color="current" /> : (
          <>
            {startContent}
            {children}
            {endContent}
          </>
        )}
      </Comp>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
