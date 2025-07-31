export function WorkflowsSkeleton() {
  return (
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
  )
}