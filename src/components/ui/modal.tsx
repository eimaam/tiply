import * as React from "react"
import { Modal as AntModal, ModalProps as AntModalProps } from "antd"
import { cn } from "@/lib/utils"
import { cva, type VariantProps } from "class-variance-authority"
import { motion, AnimatePresence } from "framer-motion" // Import framer-motion

const modalVariants = cva(
  "rounded-lg border border-brand-border bg-brand-background shadow-lg",
  {
    variants: {
      size: {
        sm: "max-w-sm",
        md: "max-w-md",
        lg: "max-w-lg",
        xl: "max-w-xl",
        "2xl": "max-w-2xl",
        "3xl": "max-w-3xl",
        "4xl": "max-w-4xl",
        full: "max-w-full",
      },
    },
    defaultVariants: {
      size: "md",
    },
  }
)

// Extract variant properties to avoid naming conflicts
type ModalVariantProps = VariantProps<typeof modalVariants>;

export interface ModalProps extends Omit<AntModalProps, "size"> {
  containerClassName?: string;
  headerClassName?: string;
  bodyClassName?: string;
  footerClassName?: string;
  closable?: boolean;
  size?: ModalVariantProps["size"];
}

function Modal({
  children,
  className,
  containerClassName,
  headerClassName,
  bodyClassName,
  footerClassName,
  size,
  closable = true,
  ...props
}: ModalProps) {
  // Animation variants for the modal
  const modalAnimationVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { 
        type: "spring",
        damping: 25,
        stiffness: 400
      }
    },
    exit: { 
      opacity: 0, 
      scale: 0.98,
      transition: { 
        duration: 0.15,
        ease: "easeOut" 
      }
    }
  };

  return (
    <AntModal
      className={cn(modalVariants({ size }), containerClassName)}
      closable={closable}
      centered
      footer={null}
      modalRender={(modal) => (
        <AnimatePresence>
          {props.open && (
            <motion.div
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={modalAnimationVariants}
            >
              {modal}
            </motion.div>
          )}
        </AnimatePresence>
      )}
      {...props}
    >
      <div className={cn("flex flex-col", className)}>
        {children}
      </div>
    </AntModal>
  )
}

// Exported components for consistent usage pattern
function ModalHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "mb-4 flex flex-col space-y-1.5 text-left",
        className
      )}
      {...props}
    />
  )
}

function ModalTitle({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn(
        "text-lg font-semibold leading-none tracking-tight text-brand-foreground",
        className
      )}
      {...props}
    />
  )
}

function ModalDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn("text-sm text-brand-muted-foreground", className)}
      {...props}
    />
  )
}

function ModalBody({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "py-2",
        className
      )}
      {...props}
    />
  )
}

function ModalFooter({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-2",
        className
      )}
      {...props}
    />
  )
}

export {
  Modal,
  ModalHeader,
  ModalTitle,
  ModalDescription,
  ModalBody,
  ModalFooter
}