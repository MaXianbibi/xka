import React from 'react'
import { cn } from '@/app/lib/utils'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
    size?: 'sm' | 'md' | 'lg'
    isLoading?: boolean
    children: React.ReactNode
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
    const baseClasses = 'inline-flex items-center justify-center font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-zinc-950 disabled:opacity-50 disabled:cursor-not-allowed'

    const variants = {
        primary: 'bg-blue-500 hover:bg-blue-600 text-white focus:ring-blue-500/50',
        secondary: 'bg-zinc-800/60 hover:bg-zinc-800 border border-zinc-700/50 hover:border-zinc-600 text-zinc-300 hover:text-white focus:ring-zinc-600/50',
        danger: 'bg-red-600/80 hover:bg-red-600 text-white focus:ring-red-500/50',
        ghost: 'hover:bg-zinc-800/30 text-zinc-300 hover:text-white focus:ring-zinc-600/50'
    }

    const sizes = {
        sm: 'px-3 py-1.5 rounded-md text-sm',
        md: 'px-4 py-2.5 rounded-lg text-sm',
        lg: 'px-6 py-3 rounded-lg text-base'
    }

    return (
        <button
            className={cn(baseClasses, variants[variant], sizes[size], className)}
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