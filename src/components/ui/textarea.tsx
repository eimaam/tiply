import * as React from "react"
import { cn } from "@/lib/utils"
import { Label } from "@/components/ui/label"
import { Input as AntInput } from "antd"
import { TextAreaProps as AntTextAreaProps } from "antd/es/input"
import { cva, type VariantProps } from "class-variance-authority"

const { TextArea: AntTextArea } = AntInput

const textareaVariants = cva(
  "min-h-[80px] w-full rounded-md border border-brand-border bg-brand-background px-3 py-2 text-sm ring-offset-brand-background placeholder:text-brand-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "border-brand-border",
        error: "border-red-500 focus-visible:ring-red-500",
        success: "border-green-500 focus-visible:ring-green-500",
      },
      size: {
        sm: "min-h-[60px] text-xs",
        md: "min-h-[80px]",
        lg: "min-h-[120px] text-lg",
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

export interface TextareaProps
  extends Omit<AntTextAreaProps, "size">,
  VariantProps<typeof textareaVariants> {
  label?: string;
  error?: string;
  helperText?: string;
  containerClassName?: string;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ 
    className, 
    label, 
    variant, 
    size,
    rounded,
    error,
    helperText,
    containerClassName,
    ...props 
  }, ref) => {
    const id = React.useId()
    const textareaVariant = error ? "error" : variant

    return (
      <div className={cn("space-y-2", containerClassName)}>
        {label && <Label htmlFor={id}>{label}</Label>}
        
        <AntTextArea
          id={id}
          className={cn(textareaVariants({ 
            variant: textareaVariant,
            size,
            rounded
          }), className)}
          ref={ref}
          style={{
            // Override Ant Design's default styles
            boxShadow: "none",
            resize: props.resize || "vertical"
          }}
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

Textarea.displayName = "Textarea"

export { Textarea, textareaVariants }