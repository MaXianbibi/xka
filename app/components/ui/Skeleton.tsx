interface SkeletonProps {
  className?: string
}

export function Skeleton({ className = '' }: SkeletonProps) {
  return <div className={`bg-zinc-800 rounded animate-pulse ${className}`} />
}

export function StatsSkeleton() {
  return (
    <div className="bg-gradient-to-b from-zinc-900 to-zinc-950 border border-zinc-800 rounded-lg overflow-hidden">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 divide-x divide-zinc-800">
        {Array.from({ length: 4 }).map((_, i) => (
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
        {Array.from({ length: 3 }).map((_, i) => (
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