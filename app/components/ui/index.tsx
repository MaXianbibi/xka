'use client'

import React, { useState, useEffect, ReactNode } from 'react'
import { clsx } from 'clsx'
import { AlertTriangle, RefreshCw, CheckCircle, XCircle } from 'lucide-react'

// ============================================================================
// BUTTON COMPONENT - Simplifié avec clsx
// ============================================================================

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
}

export function Button({
  variant = 'secondary',
  size = 'sm',
  isLoading = false,
  className,
  disabled,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={clsx(
        // Base styles
        'inline-flex items-center justify-center font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-zinc-950 disabled:opacity-50 disabled:cursor-not-allowed',
        
        // Variants
        {
          'bg-blue-500 hover:bg-blue-600 text-white focus:ring-blue-500/50': variant === 'primary',
          'bg-zinc-800/60 hover:bg-zinc-800 border border-zinc-700/50 hover:border-zinc-600 text-zinc-300 hover:text-white focus:ring-zinc-600/50': variant === 'secondary',
          'bg-red-600/80 hover:bg-red-600 text-white focus:ring-red-500/50': variant === 'danger',
          'hover:bg-zinc-800/30 text-zinc-300 hover:text-white focus:ring-zinc-600/50': variant === 'ghost'
        },
        
        // Sizes
        {
          'px-3 py-1.5 rounded-md text-sm': size === 'sm',
          'px-4 py-2.5 rounded-lg text-sm': size === 'md',
          'px-6 py-3 rounded-lg text-base': size === 'lg'
        },
        
        className
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      )}
      {children}
    </button>
  )
}

// ============================================================================
// SWITCH COMPONENT - Optimisé avec clsx
// ============================================================================

interface SwitchProps {
  checked: boolean
  onChange?: (checked: boolean) => void
  size?: 'sm' | 'md'
  disabled?: boolean
}

export function Switch({ checked, onChange, size = 'sm', disabled = false }: SwitchProps) {
  return (
    <button
      type="button"
      onClick={() => !disabled && onChange?.(!checked)}
      disabled={disabled}
      className={clsx(
        'relative inline-flex shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500/20',
        {
          'bg-green-500': checked && !disabled,
          'bg-zinc-600': !checked && !disabled,
          'bg-zinc-700 cursor-not-allowed': disabled,
          'h-4 w-7': size === 'sm',
          'h-5 w-9': size === 'md'
        }
      )}
    >
      <span
        className={clsx(
          'pointer-events-none inline-block transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
          {
            'h-3 w-3': size === 'sm',
            'h-4 w-4': size === 'md',
            'translate-x-3': checked && size === 'sm',
            'translate-x-4': checked && size === 'md',
            'translate-x-0': !checked
          }
        )}
      />
    </button>
  )
}

// ============================================================================
// SKELETON COMPONENTS - Consolidés
// ============================================================================

interface SkeletonProps {
  className?: string
}

export function Skeleton({ className }: SkeletonProps) {
  return <div className={clsx('bg-zinc-800 rounded animate-pulse', className)} />
}

export function StatsSkeleton() {
  return (
    <div className="bg-gradient-to-b from-zinc-900 to-zinc-950 border border-zinc-800 rounded-lg overflow-hidden">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 divide-x divide-zinc-800">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="p-6 space-y-3">
            <div className="flex items-center space-x-3">
              <Skeleton className="h-5 w-5" />
              <Skeleton className="h-4 w-24" />
            </div>
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-3 w-20" />
          </div>
        ))}
      </div>
    </div>
  )
}

export function WorkflowsSkeleton() {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
      <div className="px-6 py-5 border-b border-zinc-800">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-32" />
          <div className="flex space-x-3">
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-8 w-24" />
          </div>
        </div>
      </div>
      
      <div className="divide-y divide-zinc-800">
        {Array.from({ length: 3 }, (_, i) => (
          <div key={i} className="px-6 py-4">
            <div className="flex items-center space-x-4">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-6 w-12" />
              <div className="flex-1 flex space-x-4">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-3 w-24" />
              </div>
              <Skeleton className="h-8 w-8" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ============================================================================
// ALERT COMPONENT - Simplifié avec délai intégré
// ============================================================================

interface AlertProps {
  isVisible: boolean
  onRetry?: () => void
  delay?: number
  variant?: 'warning' | 'error' | 'success'
  title: string
  description?: string
  action?: ReactNode
}

export function Alert({ 
  isVisible, 
  onRetry, 
  delay = 1000, 
  variant = 'warning',
  title,
  description,
  action
}: AlertProps) {
  const [shouldShow, setShouldShow] = useState(false)
  const [isRetrying, setIsRetrying] = useState(false)

  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => setShouldShow(true), delay)
      return () => clearTimeout(timer)
    } else {
      setShouldShow(false)
    }
  }, [isVisible, delay])

  const handleRetry = async () => {
    if (!onRetry) return
    setIsRetrying(true)
    await onRetry()
    setIsRetrying(false)
  }

  const Icon = variant === 'warning' ? AlertTriangle : variant === 'error' ? XCircle : CheckCircle

  return (
    <div
      className={clsx(
        'mx-6 my-4 p-4 border rounded-lg flex items-center gap-3 transition-all duration-300 ease-out',
        {
          'opacity-100 translate-y-0': shouldShow,
          'opacity-0 -translate-y-2': !shouldShow,
          'bg-yellow-900/20 border-yellow-600/30': variant === 'warning',
          'bg-red-900/20 border-red-600/30': variant === 'error',
          'bg-green-900/20 border-green-600/30': variant === 'success'
        }
      )}
    >
      <Icon className={clsx('h-5 w-5 flex-shrink-0', {
        'text-yellow-400': variant === 'warning',
        'text-red-400': variant === 'error',
        'text-green-400': variant === 'success'
      })} />
      
      <div className="flex-1">
        <h3 className={clsx('font-medium text-sm', {
          'text-yellow-400': variant === 'warning',
          'text-red-400': variant === 'error',
          'text-green-400': variant === 'success'
        })}>
          {title}
        </h3>
        {description && (
          <p className={clsx('text-xs mt-1', {
            'text-yellow-300/80': variant === 'warning',
            'text-red-300/80': variant === 'error',
            'text-green-300/80': variant === 'success'
          })}>
            {description}
          </p>
        )}
      </div>
      
      {onRetry && (
        <Button
          onClick={handleRetry}
          isLoading={isRetrying}
          size="sm"
          className={clsx('text-xs', {
            'bg-yellow-800/30 hover:bg-yellow-800/50 border-yellow-600/30 text-yellow-200': variant === 'warning',
            'bg-red-800/30 hover:bg-red-800/50 border-red-600/30 text-red-200': variant === 'error',
            'bg-green-800/30 hover:bg-green-800/50 border-green-600/30 text-green-200': variant === 'success'
          })}
        >
          <RefreshCw className="h-3 w-3 mr-1" />
          {isRetrying ? 'Vérification...' : 'Réessayer'}
        </Button>
      )}
      
      {action}
    </div>
  )
}

// ============================================================================
// SCROLL AREA - Simplifié
// ============================================================================

interface ScrollAreaProps {
  children: ReactNode
  className?: string
  variant?: 'default' | 'thin' | 'overlay' | 'hidden'
  maxHeight?: string
}

export function ScrollArea({ children, className, variant = 'default', maxHeight }: ScrollAreaProps) {
  return (
    <div 
      className={clsx(
        'overflow-auto',
        {
          'custom-scrollbar': variant === 'default',
          'scrollbar-thin': variant === 'thin',
          'scrollbar-overlay': variant === 'overlay',
          'scrollbar-hide': variant === 'hidden'
        },
        className
      )}
      style={maxHeight ? { maxHeight } : undefined}
    >
      {children}
    </div>
  )
}

// ============================================================================
// ERROR BOUNDARY - Simplifié
// ============================================================================

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends React.Component<
  { children: ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <Alert
          isVisible={true}
          variant="error"
          title="Erreur de chargement"
          description={this.state.error?.message || 'Une erreur inattendue s\'est produite.'}
          action={
            <Button
              onClick={() => this.setState({ hasError: false })}
              size="sm"
              className="bg-red-800/30 hover:bg-red-800/50 border-red-600/30 text-red-200 text-xs"
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              Réessayer
            </Button>
          }
        />
      )
    }

    return this.props.children
  }
}