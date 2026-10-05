'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'

import { Button } from '@/shared/ui/button'

interface ProjectPaginationProps {
  readonly page: number
  readonly totalPages: number
  readonly total: number
  readonly onPageChange: (page: number) => void
}

export const ProjectPagination = ({
  page,
  totalPages,
  total,
  onPageChange,
}: ProjectPaginationProps) => {
  if (totalPages <= 1) {
    return null
  }

  return (
    <div className="flex shrink-0 items-center justify-between gap-4">
      <span className="text-xs">{total} projects</span>

      <div className="flex items-center gap-3">
        <span className="text-xs" aria-live="polite">
          Page {page} of {totalPages}
        </span>

        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="size-8"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
            aria-label="Previous page"
          >
            <ChevronLeft className="size-4" />
          </Button>

          <Button
            type="button"
            variant="outline"
            size="icon"
            className="size-8"
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
            aria-label="Next page"
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
