import React from 'react'

export default function Loading() {
  return (
    <div className="flex-1 bg-zinc-950 overflow-auto">
      {/* Header skeleton */}
      <div className="border-b border-zinc-800 p-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-8 w-48 bg-zinc-800 rounded animate-pulse mb-2" />
            <div className="h-4 w-32 bg-zinc-800 rounded animate-pulse" />
          </div>
          <div className="h-10 w-32 bg-zinc-800 rounded animate-pulse" />
        </div>
      </div>

      <div className="p-6 space-y-8">
        {/* Stats skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-zinc-900 rounded-lg p-6 border border-zinc-800">
              <div className="h-4 w-24 bg-zinc-800 rounded animate-pulse mb-2" />
              <div className="h-8 w-16 bg-zinc-800 rounded animate-pulse mb-1" />
              <div className="h-3 w-20 bg-zinc-800 rounded animate-pulse" />
            </div>
          ))}
        </div>

        {/* Tab navigation skeleton */}
        <div className="flex space-x-1 bg-zinc-900 p-1 rounded-lg w-fit">
          <div className="h-10 w-24 bg-zinc-800 rounded animate-pulse" />
          <div className="h-10 w-24 bg-zinc-800 rounded animate-pulse" />
        </div>

        {/* Content skeleton */}
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-zinc-900 rounded-lg p-6 border border-zinc-800">
              <div className="flex items-center justify-between mb-4">
                <div className="h-6 w-48 bg-zinc-800 rounded animate-pulse" />
                <div className="h-6 w-20 bg-zinc-800 rounded animate-pulse" />
              </div>
              <div className="space-y-2">
                <div className="h-4 w-32 bg-zinc-800 rounded animate-pulse" />
                <div className="h-4 w-24 bg-zinc-800 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}