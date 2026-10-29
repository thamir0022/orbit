'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'

import { Button } from '@/shared/ui/button'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
} from '@/shared/ui/pagination'

interface StoriesPaginationProps {
  readonly page: number
  readonly totalPages: number
  readonly total: number
  readonly firstStoryIndex: number
  readonly lastStoryIndex: number
  readonly onPageChange: (page: number) => void
}

type PageItem = number | 'start-ellipsis' | 'end-ellipsis'

function getPageItems(page: number, totalPages: number): readonly PageItem[] {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, index) => index + 1)
  }

  if (page <= 3) {
    return [1, 2, 3, 'end-ellipsis', totalPages]
  }

  if (page >= totalPages - 2) {
    return [1, 'start-ellipsis', totalPages - 2, totalPages - 1, totalPages]
  }

  return [1, 'start-ellipsis', page, 'end-ellipsis', totalPages]
}

export function StoriesPagination({
  page,
  totalPages,
  total,
  firstStoryIndex,
  lastStoryIndex,
  onPageChange,
}: StoriesPaginationProps) {
  return (
    <Pagination
      aria-label="Stories pagination"
      className="shrink-0 flex-col gap-3 sm:flex-row sm:justify-between"
    >
      <p
        className="text-center text-xs text-muted-foreground sm:text-left"
        aria-live="polite"
      >
        Showing {firstStoryIndex}–{lastStoryIndex} of {total} stories · Page{' '}
        {page} of {totalPages}
      </p>

      <PaginationContent>
        <PaginationItem>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="size-8"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
            aria-label="Previous page"
          >
            <ChevronLeft aria-hidden="true" className="size-4" />
          </Button>
        </PaginationItem>

        {getPageItems(page, totalPages).map((item) => {
          if (typeof item !== 'number') {
            return (
              <PaginationItem key={item}>
                <PaginationEllipsis />
              </PaginationItem>
            )
          }

          const isCurrentPage = item === page

          return (
            <PaginationItem key={item}>
              <Button
                type="button"
                variant={isCurrentPage ? 'outline' : 'ghost'}
                size="icon"
                className="size-8"
                onClick={() => onPageChange(item)}
                aria-current={isCurrentPage ? 'page' : undefined}
                aria-label={`Go to page ${item}`}
              >
                {item}
              </Button>
            </PaginationItem>
          )
        })}

        <PaginationItem>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="size-8"
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
            aria-label="Next page"
          >
            <ChevronRight aria-hidden="true" className="size-4" />
          </Button>
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  )
}
