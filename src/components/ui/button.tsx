import * as React from "react"
import { cn } from "@/lib/utils"
import { Button as AntButton, ButtonProps as AntButtonProps } from "antd"
import { cva, type VariantProps } from "class-variance-authority"

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus:!outline-none focus:ring-2 focus:ring-brand-accent focus:ring-offset-2 gap-2  focus:ring-2 focus:ring-brand-accent focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "!bg-brand-primary text-brand-primary-foreground hover:bg-brand-accent",
        outline: "border border-brand-border bg-transparent hover:bg-brand-surface text-brand-foreground",
        ghost: "bg-transparent hover:bg-brand-surface text-brand-foreground",
        destructive: "bg-red-600 text-white hover:bg-red-700",
        link: "underline-offset-4 hover:underline text-brand-accent bg-transparent",
        secondary: "bg-brand-secondary text-brand-secondary-foreground hover:bg-brand-secondary/80",
      },
      size: {
        sm: "h-8 px-3 text-xs",
        md: "h-10 px-4 py-2",
        lg: "h-12 px-8 text-lg",
        icon: "h-10 w-10",
      },
      fullWidth: {
        true: "w-full",
        false: "w-auto",
      },
      rounded: {
        default: "rounded-[2px]",
        md: "rounded-md",
        lg: "rounded-lg",
        full: "rounded-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
      fullWidth: false,
      rounded: "md",
    },
  }
)

interface ButtonProps
  extends Omit<AntButtonProps, "size" | "type">,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
  icon?: React.ReactNode;
  suffix?: React.ReactNode;
  htmlType?: "button" | "submit" | "reset";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className, 
    variant, 
    size, 
    fullWidth,
    rounded,
    loading, 
    icon,
    suffix,
    htmlType = "button",
    children, 
    ...props 
  }, ref) => {
    // Map our size variants to Ant Design's size options
    const antSize = size === "sm" ? "small" : size === "lg" ? "large" : "middle";
    
    return (
      <AntButton
        className={cn(buttonVariants({ 
          variant, 
          size, 
          fullWidth,
          rounded,
          className 
        }))}
        style={{
          // Override Ant Design's default styles
          background: "unset",
          boxShadow: "none",
        }}
        size={antSize}
        loading={loading}
        icon={icon}
        htmlType={htmlType}
        ref={ref}
        {...props}
      >
        {children}
        {suffix && <span className="ml-2 inline-flex">{suffix}</span>}
      </AntButton>
    )
  }
)

Button.displayName = "Button"

export { Button, buttonVariants }