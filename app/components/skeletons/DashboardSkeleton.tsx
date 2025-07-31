export function DashboardSkeleton() {
  return (
    <div className="flex-1 bg-zinc-950 overflow-auto">
      {/* Header skeleton */}
      <div className="border-b border-zinc-800 p-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-8 w-48 bg-zinc-800 rounded animate-pulse mb-2" />
            <div className="h-4 w-64 bg-zinc-800 rounded animate-pulse" />
          </div>
          <div className="flex space-x-3">
            <div className="h-12 w-12 bg-zinc-800 rounded-lg animate-pulse" />
            <div className="h-12 w-40 bg-zinc-800 rounded-lg animate-pulse" />
          </div>
        </div>
      </div>

      <div className="p-6 space-y-8">
        {/* Stats skeleton */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 w-24 bg-zinc-800 rounded animate-pulse" />
                <div className="h-8 w-16 bg-zinc-800 rounded animate-pulse" />
                <div className="h-3 w-20 bg-zinc-800 rounded animate-pulse" />
              </div>
            ))}
          </div>
        </div>

        {/* Workflows skeleton */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
          <div className="px-6 py-5 border-b border-zinc-800">
            <div className="flex items-center justify-between">
              <div className="h-6 w-32 bg-zinc-800 rounded animate-pulse" />
              <div className="flex space-x-3">
                <div className="h-8 w-24 bg-zinc-800 rounded animate-pulse" />
                <div className="h-8 w-24 bg-zinc-800 rounded animate-pulse" />
              </div>
            </div>
          </div>
          
          <div className="divide-y divide-zinc-800">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="px-6 py-4">
                <div className="flex items-center space-x-4">
                  <div className="h-4 w-32 bg-zinc-800 rounded animate-pulse" />
                  <div className="h-4 w-16 bg-zinc-800 rounded animate-pulse" />
                  <div className="h-6 w-12 bg-zinc-800 rounded animate-pulse" />
                  <div className="flex-1 flex space-x-4">
                    <div className="h-3 w-20 bg-zinc-800 rounded animate-pulse" />
                    <div className="h-3 w-20 bg-zinc-800 rounded animate-pulse" />
                    <div className="h-3 w-24 bg-zinc-800 rounded animate-pulse" />
                  </div>
                  <div className="h-8 w-8 bg-zinc-800 rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}