import { cva } from 'class-variance-authority'

export const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-brand-accent focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "bg-brand-primary text-brand-primary-foreground hover:bg-brand-accent",
        outline: "border border-brand-border bg-transparent hover:bg-brand-surface text-brand-foreground",
        ghost: "bg-transparent hover:bg-brand-surface text-brand-foreground",
        destructive: "bg-red-600 text-white hover:bg-red-700",
        link: "underline-offset-4 hover:underline text-brand-accent",
      },
      size: {
        sm: "h-8 px-3 text-xs",
        md: "h-10 px-4 py-2",
        lg: "h-12 px-8 text-lg",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
)