import { Skeleton } from '@/shared/ui/skeleton'

export const ProjectOverviewSkeleton = () => {
  return (
    <div className="flex min-h-0 min-w-0 w-full flex-1 flex-col">
      <div className="flex shrink-0 items-center border-b px-6 py-3">
        <Skeleton className="h-8 w-16" />
      </div>

      <div className="flex-1 px-6 py-8">
        <div className="mx-auto w-full max-w-5xl space-y-10">
          <div className="flex items-start gap-4">
            <Skeleton className="size-14 rounded-xl" />

            <div className="space-y-3">
              <Skeleton className="h-10 w-72" />

              <div className="flex gap-2">
                <Skeleton className="h-6 w-14" />
                <Skeleton className="h-6 w-20" />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-32 w-full max-w-3xl" />
          </div>
        </div>
      </div>
    </div>
  )
}
