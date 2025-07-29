import { formatDistanceToNow, parseISO } from 'date-fns'
import { clsx } from 'clsx'

/**
 * Format a date string to relative time using date-fns
 * More robust and internationalization-ready
 */
export function formatRelativeTime(dateString: string): string {
  try {
    const date = parseISO(dateString)
    return formatDistanceToNow(date, { 
      addSuffix: true,
      includeSeconds: false 
    })
  } catch (error) {
    console.warn('Invalid date string:', dateString)
    return 'Unknown'
  }
}

/**
 * Get tag color classes for workflow tags using clsx for better class management
 */
export function getTagColor(tag: string): string {
  const baseClasses = 'px-2 py-1 rounded-full text-xs font-medium border'
  
  const tagColors: Record<string, string> = {
    'Authentication': 'bg-blue-400/10 text-blue-400 border-blue-400/20',
    'Finance': 'bg-green-400/10 text-green-400 border-green-400/20',
    'Marketing': 'bg-purple-400/10 text-purple-400 border-purple-400/20',
    'Integration': 'bg-orange-400/10 text-orange-400 border-orange-400/20',
    'Operations': 'bg-cyan-400/10 text-cyan-400 border-cyan-400/20'
  }
  
  const colorClasses = tagColors[tag] || 'bg-zinc-400/10 text-zinc-400 border-zinc-400/20'
  
  return clsx(baseClasses, colorClasses)
}

/**
 * Get status badge classes using clsx
 */
export function getStatusBadgeClasses(status: string): string {
  const baseClasses = 'px-2 py-1 rounded-full text-xs font-medium'
  
  return clsx(baseClasses, {
    'bg-green-400/10 text-green-400 border border-green-400/20': status === 'success',
    'bg-red-400/10 text-red-400 border border-red-400/20': status === 'failed',
    'bg-zinc-400/10 text-zinc-400 border border-zinc-400/20': status !== 'success' && status !== 'failed'
  })
}