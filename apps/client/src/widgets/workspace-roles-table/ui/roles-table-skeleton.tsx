'use client'

import { Skeleton } from '@/shared/ui/skeleton'

type RolesTableSkeletonProps = {
  rows?: number
}

export function RolesTableSkeleton({ rows = 6 }: RolesTableSkeletonProps) {
  return (
    <div className="overflow-hidden rounded-2xl border">
      <div className="border-b p-4">
        <Skeleton className="h-5 w-32" />
      </div>

      <div className="divide-y">
        {Array.from({ length: rows }).map((_, index) => (
          <div key={index} className="grid gap-4 px-4 py-4 sm:grid-cols-4">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-5 w-72" />
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-10 w-40" />
          </div>
        ))}
      </div>
    </div>
  )
}
