export function StatsSkeleton() {
  return (
    <div className="bg-gradient-to-b from-zinc-900 to-zinc-950 border border-zinc-800 rounded-lg overflow-hidden">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 divide-x divide-zinc-800">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="p-6 space-y-3">
            <div className="flex items-center space-x-3">
              <div className="h-5 w-5 bg-zinc-800 rounded animate-pulse" />
              <div className="h-4 w-24 bg-zinc-800 rounded animate-pulse" />
            </div>
            <div className="h-8 w-16 bg-zinc-800 rounded animate-pulse" />
            <div className="h-3 w-20 bg-zinc-800 rounded animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  )
}