import * as React from "react"
import { cn } from "@/lib/utils"
import { Select as AntSelect, SelectProps as AntSelectProps } from "antd"
import { Label } from "@/components/ui/label"
import { cva, type VariantProps } from "class-variance-authority"
import { DefaultOptionType } from "antd/es/select"

const selectVariants = cva(
  "w-full rounded-md border border-brand-border bg-brand-background text-sm ring-offset-brand-background placeholder:text-brand-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand-accent focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
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
type SelectVariantProps = VariantProps<typeof selectVariants>;

export interface SelectProps<T = any>
  extends Omit<AntSelectProps<T>, "size" | "options" | "variant"> {
  label?: string;
  error?: string;
  helperText?: string;
  containerClassName?: string;
  variant?: SelectVariantProps["variant"];
  size?: SelectVariantProps["size"];
  rounded?: SelectVariantProps["rounded"];
  options?: {
    label: React.ReactNode;
    value: T;
    disabled?: boolean;
    className?: string;
    [key: string]: any;
  }[];
}

function Select<T = any>({
  className,
  label,
  variant,
  size,
  rounded,
  error,
  helperText,
  containerClassName,
  options,
  ...props
}: SelectProps<T>) {
  const id = React.useId()
  const selectVariant = error ? "error" : variant
  
  // Map our size variants to Ant Design's size options
  const antSize = size === "sm" ? "small" : size === "lg" ? "large" : "middle"
  
  // Convert our options format to Ant Design's format if provided
  const antOptions: DefaultOptionType[] | undefined = options?.map(option => ({
    label: option.label,
    value: option.value,
    disabled: option.disabled,
    className: option.className,
  }))

  return (
    <div className={cn("space-y-2", containerClassName)}>
      {label && <Label htmlFor={id}>{label}</Label>}
      
      <AntSelect
        id={id}
        className={cn(selectVariants({
          variant: selectVariant,
          size,
          rounded,
        }), className)}
        style={{
          width: '100%',
        }}
        size={antSize}
        status={error ? "error" : undefined}
        options={antOptions}
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

Select.displayName = "Select"

export { Select }