import { Skeleton } from '@/shared/ui/skeleton'

export const ProjectSkeleton = () => {
  return (
    <div className="flex min-h-0 min-w-0 w-full flex-1 flex-col gap-5">
      {/* Header */}
      <div className="flex shrink-0 items-start justify-between">
        <div className="space-y-2">
          <Skeleton className="h-6 w-28" />
          <Skeleton className="h-4 w-64" />
        </div>

        <Skeleton className="h-8 w-20 rounded-md" />
      </div>

      {/* Toolbar */}
      <div className="flex shrink-0 items-center gap-3">
        <Skeleton className="h-9 w-full max-w-sm rounded-md" />
        <Skeleton className="h-8 w-24 rounded-md" />
        <Skeleton className="h-8 w-24 rounded-md" />
      </div>

      {/* Content */}
      <div className="min-h-0 min-w-0 flex-1 overflow-hidden rounded-lg border">
        <div className="min-w-240">
          <div className="grid grid-cols-[minmax(22rem,1fr)_8rem_8rem_12rem_10rem] gap-4 border-b px-4 py-3">
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} className="h-3" />
            ))}
          </div>

          {Array.from({ length: 8 }).map((_, index) => (
            <div
              key={index}
              className="grid min-h-16 grid-cols-[minmax(22rem,1fr)_8rem_8rem_12rem_10rem] items-center gap-4 border-b px-4 last:border-b-0"
            >
              <div className="flex items-center gap-3">
                <Skeleton className="size-8 rounded-md" />

                <div className="space-y-2">
                  <Skeleton className="h-3.5 w-40" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>

              <Skeleton className="h-6 w-20 rounded-full" />

              <Skeleton className="h-3.5 w-16" />

              <div className="flex items-center gap-2">
                <Skeleton className="size-6 rounded-full" />
                <Skeleton className="h-3.5 w-24" />
              </div>

              <Skeleton className="h-3.5 w-20" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
