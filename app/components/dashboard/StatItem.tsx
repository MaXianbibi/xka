import React from 'react'

interface StatItemProps {
  title: string
  value: string | number
  subtitle?: string
  icon: React.ElementType
}

export function StatItem({ title, value, subtitle, icon: Icon }: StatItemProps) {
  return (
    <div className="flex items-center space-x-4 p-6 hover:bg-zinc-800/50 transition-colors">
      <div className="p-3 bg-zinc-800/70 rounded-lg">
        <Icon className="w-6 h-6 text-zinc-200" />
      </div>
      <div className="flex-1">
        <h3 className="text-2xl font-bold text-white tracking-tight">{value}</h3>
        <p className="text-sm text-zinc-300">{title}</p>
        {subtitle && (
          <p className="text-xs text-zinc-400 mt-1">{subtitle}</p>
        )}
      </div>
    </div>
  )
}