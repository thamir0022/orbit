'use client'

import { Skeleton } from '@/shared/ui/skeleton'

type MembersTableSkeletonProps = {
  rows?: number
}

export function MembersTableSkeleton({ rows = 8 }: MembersTableSkeletonProps) {
  return (
    <div className="overflow-hidden rounded-2xl border">
      <div className="border-b px-4 py-3">
        <Skeleton className="h-5 w-32" />
      </div>
      <div className="divide-y">
        {Array.from({ length: rows }).map((_, index) => (
          <div
            key={index}
            className="grid grid-cols-1 gap-4 px-4 py-4 sm:grid-cols-4"
          >
            <Skeleton className="h-5 w-56" />
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-5 w-40" />
          </div>
        ))}
      </div>
    </div>
  )
}