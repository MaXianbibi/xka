import { clsx, type ClassValue } from 'clsx'

/**
 * Utility function to merge class names using clsx
 * Follows the libraries-first approach for better maintainability
 */
export function cn(...inputs: ClassValue[]) {
    return clsx(inputs)
}

/**
 * Common button variants using clsx
 */
export const buttonVariants = {
    primary: 'bg-blue-500 hover:bg-blue-600 text-white transition-colors',
    secondary: 'bg-zinc-800/50 hover:bg-zinc-800 text-white transition-colors',
    danger: 'bg-red-500 hover:bg-red-600 text-white transition-colors',
    ghost: 'hover:bg-zinc-800/30 text-zinc-300 hover:text-white transition-colors'
}

/**
 * Common input variants
 */
export const inputVariants = {
    default: 'bg-zinc-800/50 border border-zinc-800 text-white px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 hover:bg-zinc-800 transition-colors'
}

/**
 * Card variants
 */
export const cardVariants = {
    default: 'bg-zinc-800/50 border border-zinc-800 rounded-lg hover:bg-zinc-800/70 transition-colors',
    gradient: 'bg-gradient-to-b from-zinc-950 to-zinc-900 border border-zinc-800 rounded-lg shadow-lg'
}