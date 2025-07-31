'use client'

import React from 'react'
import { clsx } from 'clsx'

interface ActionButtonProps {
  children: React.ReactNode
  onClick?: () => void
  disabled?: boolean
  variant?: 'primary' | 'secondary' | 'action' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function ActionButton({ 
  children, 
  onClick, 
  disabled = false, 
  variant = 'secondary',
  size = 'sm',
  className 
}: ActionButtonProps) {
  const baseClasses = "group relative transition-all duration-300 flex items-center justify-center font-medium overflow-hidden focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-zinc-950"
  
  const variantClasses = {
    primary: "bg-blue-500 hover:bg-blue-600 text-white focus:ring-blue-500/50",
    secondary: "bg-zinc-800/60 hover:bg-zinc-800 border border-zinc-700/50 hover:border-zinc-600 text-zinc-300 hover:text-white focus:ring-zinc-600/50 marching-border-secondary border-style",
    action: "bg-green-600/80 hover:bg-green-600 text-white focus:ring-green-500/50 marching-border-action",
    danger: "bg-red-600/80 hover:bg-red-600 text-white focus:ring-red-500/50"
  }
  
  const sizeClasses = {
    sm: "px-2 py-1.5 rounded-md text-sm",
    md: "px-4 py-2.5 rounded-lg text-sm",
    lg: "px-6 py-3 rounded-lg text-base"
  }
  
  const disabledClasses = "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-current"

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={clsx(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        disabledClasses,
        className
      )}
    >
      {children}
      
      {/* Glow effect for primary and action variants */}
      {(variant === 'primary' || variant === 'action') && (
        <div className={clsx(
          "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-lg",
          variant === 'primary' && "bg-gradient-to-r from-transparent via-blue-400/20 to-transparent",
          variant === 'action' && "bg-gradient-to-r from-transparent via-green-400/20 to-transparent"
        )} />
      )}
    </button>
  )
}