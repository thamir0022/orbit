import { Skeleton } from '@/shared/ui/skeleton'

export function TeamOverviewSkeleton() {
  return (
    <div className="mx-auto w-full max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-4">
        <Skeleton className="h-8 w-24" />

        <div className="mt-3 flex items-center gap-1">
          <Skeleton className="h-8 w-20 rounded-full" />
          <Skeleton className="h-8 w-20 rounded-full" />
        </div>
      </div>

      <div className="grid min-w-0 grid-cols-1 items-start gap-4 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <section>
          <div className="overflow-hidden rounded-2xl border">
            <div className="p-7 md:p-8">
              <div className="flex items-center gap-4">
                <Skeleton className="size-16 rounded-xl" />

                <div className="min-w-0 flex-1 space-y-2">
                  <Skeleton className="h-8 w-56" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </div>

              <div className="mt-8 flex flex-wrap gap-2">
                <Skeleton className="h-8 w-20 rounded-full" />
                <Skeleton className="h-8 w-24 rounded-full" />
              </div>

              <Skeleton className="mt-8 h-24 w-full" />
            </div>

            <div className="border-t p-7 md:px-8">
              <div className="flex items-center justify-between gap-6">
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-5 w-40" />
              </div>
            </div>
          </div>
        </section>

        <aside>
          <div className="overflow-hidden rounded-2xl border">
            <div className="p-4">
              <Skeleton className="h-5 w-20" />
            </div>

            <div className="space-y-5 p-4 pt-1">
              <Skeleton className="h-8 w-28 rounded-full" />
              <Skeleton className="h-px w-full" />
              <Skeleton className="h-8 w-36 rounded-full" />
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
