import * as React from "react"
import { cn } from "@/lib/utils"
import { Label } from "@/components/ui/label"
import { Input as AntInput, InputProps as AntInputProps, InputRef } from "antd"
import { cva, type VariantProps } from "class-variance-authority"

const inputVariants = cva(
  "rounded-md border border-brand-border bg-brand-background px-3 py-2 text-sm ring-offset-brand-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-brand-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 w-full",
  {
    variants: {
      variant: {
        default: "border-brand-border",
        error: "border-red-500 focus-visible:ring-red-500",
        success: "border-green-500 focus-visible:ring-green-500",
      },
      size: {
        sm: "h-8 text-xs",
        md: "h-10",
        lg: "h-12 text-lg",
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
      rounded: "md",
    },
  }
)

// Extract variant properties to avoid naming conflicts
type InputVariantProps = VariantProps<typeof inputVariants>;

export interface InputProps
  extends Omit<AntInputProps, "size" | "variant"> {
  label?: string;
  error?: string;
  helperText?: string;
  prefixIcon?: React.ReactNode;
  suffixIcon?: React.ReactNode;
  containerClassName?: string;
  variant?: InputVariantProps["variant"];
  size?: InputVariantProps["size"];
  rounded?: InputVariantProps["rounded"];
}

const Input = React.forwardRef<InputRef, InputProps>(
  ({ 
    className, 
    type, 
    label, 
    variant, 
    size, 
    rounded,
    error, 
    helperText,
    prefixIcon,
    suffixIcon,
    containerClassName,
    ...props 
  }, ref) => {
    const id = React.useId()
    const inputVariant = error ? "error" : variant
    
    // Map our size variants to Ant Design's size options
    const antSize = size === "sm" ? "small" : size === "lg" ? "large" : "middle"

    return (
      <div className={cn("space-y-2", containerClassName)}>
        {label && <Label htmlFor={id}>{label}</Label>}
        
        <AntInput
          type={type}
          id={id}
          className={cn(inputVariants({ 
            variant: inputVariant, 
            size, 
            rounded 
          }), className)}
          ref={ref}
          style={{
            // Override Ant Design's default styles
            boxShadow: "none"
          }}
          size={antSize}
          prefix={prefixIcon}
          suffix={suffixIcon}
          status={error ? "error" : undefined}
          {...props}
        />
        
        {(error || helperText) && (
          <p className={cn(
            "text-xs",
            error ? "text-red-500" : "text-brand-muted-foreground"
          )}>
            {error || helperText}
          </p>
        )}
      </div>
    )
  }
)

Input.displayName = "Input"

export { Input, inputVariants }