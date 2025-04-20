import { ReactNode } from 'react'

interface ContainerProps {
  children: ReactNode,
  className?: string
}

const Container = ({ children, className }: ContainerProps) => {
  return (
    <div className={`w-full flex flex-col items-center justify-center min-h-screen p-6 md:p-10 ${className}`}>
      {children}
    </div>
  )
}

export default Container