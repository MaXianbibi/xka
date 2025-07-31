import React from 'react'
import { clsx } from 'clsx'

interface ScrollAreaProps {
  children: React.ReactNode
  className?: string
  variant?: 'default' | 'thin' | 'overlay' | 'hidden'
  maxHeight?: string
}

export function ScrollArea({ 
  children, 
  className, 
  variant = 'default',
  maxHeight 
}: ScrollAreaProps) {
  const scrollbarClasses = {
    default: 'custom-scrollbar',
    thin: 'scrollbar-thin',
    overlay: 'scrollbar-overlay',
    hidden: 'scrollbar-hide'
  }

  return (
    <div 
      className={clsx(
        'overflow-auto',
        scrollbarClasses[variant],
        className
      )}
      style={maxHeight ? { maxHeight } : undefined}
    >
      {children}
    </div>
  )
}