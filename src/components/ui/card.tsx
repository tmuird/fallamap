import { cn } from "@/utils/cn";
import * as React from "react"

const Card = React.forwardRef<
 HTMLDivElement,
 React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
 <div
  ref={ref}
  className={cn(
   "rounded-[2.5rem] ink-border bg-falla-paper text-falla-ink soft-shadow overflow-hidden transition-all",
   className
  )}
  {...props}
 />
))
Card.displayName = "Card"

const CardHeader = React.forwardRef<
 HTMLDivElement,
 React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
 <div
  ref={ref}
  className={cn("flex flex-col space-y-1.5 p-8", className)}
  {...props}
 />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
 HTMLParagraphElement,
 React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
 <h3
  ref={ref}
  className={cn(
   "text-2xl font-extrabold  tracking-normal leading-none",
   className
  )}
  {...props}
 />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
 HTMLParagraphElement,
 React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
 <p
  ref={ref}
  className={cn("text-sm text-falla-ink/60 font-medium", className)}
  {...props}
 />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
 HTMLDivElement,
 React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
 <div ref={ref} className={cn("p-8 pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

const CardBody = CardContent;

const CardFooter = React.forwardRef<
 HTMLDivElement,
 React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
 <div
  ref={ref}
  className={cn("flex items-center p-8 pt-0", className)}
  {...props}
 />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent, CardBody }
