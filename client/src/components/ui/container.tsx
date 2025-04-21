import { cn } from '@/lib/utils'
import { ReactNode } from 'react'
import { cva, type VariantProps } from "class-variance-authority"

const containerVariants = cva(
  "w-full flex flex-col items-center justify-center p-6 md:p-10",
  {
    variants: {
      height: {
        screen: "min-h-screen",
        full: "h-full",
        auto: "min-h-0",
        minimal: "min-h-fit",
        half: "min-h-[50vh]",
      },
      width: {
        full: "w-full",
        narrow: "max-w-xl mx-auto",
        wide: "max-w-4xl mx-auto",
      },
      padding: {
        none: "p-0",
        sm: "p-3 md:p-4",
        md: "p-6 md:p-10",
        lg: "p-8 md:p-12",
      },
      align: {
        center: "items-center justify-center",
        start: "items-start justify-start",
        end: "items-end justify-end",
        between: "items-center justify-between",
      }
    },
    defaultVariants: {
      height: "screen",
      width: "full",
      padding: "md",
      align: "center"
    },
  }
)

interface ContainerProps 
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof containerVariants> {
  children: ReactNode
}

const Container = ({ 
  children, 
  className, 
  height,
  width,
  padding,
  align,
  ...props 
}: ContainerProps) => {
  return (
    <div 
      className={cn(
        containerVariants({ height, width, padding, align }),
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export default Container