'use client'

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/shared/ui/pagination'

type MembersPaginationProps = {
  page: number
  totalPages: number
  onPageChange: (page: number) => void
}

function buildPageItems(currentPage: number, totalPages: number): number[] {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, index) => index + 1)
  }

  const pages = new Set<number>([1, totalPages, currentPage])

  if (currentPage > 1) pages.add(currentPage - 1)
  if (currentPage < totalPages) pages.add(currentPage + 1)

  const sorted = Array.from(pages).sort((a, b) => a - b)

  const result: number[] = []
  let previous = 0

  for (const page of sorted) {
    if (previous && page - previous > 1) {
      const gapPage = previous + 1
      result.push(gapPage)
    }

    result.push(page)
    previous = page
  }

  return result
}

export function MembersPagination({
  page,
  totalPages,
  onPageChange,
}: MembersPaginationProps) {
  if (totalPages <= 1) {
    return null
  }

  const pages = buildPageItems(page, totalPages)

  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border px-4 py-3">
      <p className="text-sm">
        Page <span className="font-medium">{page}</span> of{' '}
        <span className="font-medium">{totalPages}</span>
      </p>

      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              href="#"
              onClick={(event) => {
                event.preventDefault()
                if (page > 1) onPageChange(page - 1)
              }}
              aria-disabled={page <= 1}
              className={page <= 1 ? 'pointer-events-none opacity-50' : ''}
            />
          </PaginationItem>

          {pages.map((item, index) => {
            if (item < 0) return null

            return (
              <PaginationItem key={`${item}-${index}`}>
                <PaginationLink
                  href="#"
                  isActive={item === page}
                  onClick={(event) => {
                    event.preventDefault()
                    if (item !== page) onPageChange(item)
                  }}
                >
                  {item}
                </PaginationLink>
              </PaginationItem>
            )
          })}

          <PaginationItem>
            <PaginationNext
              href="#"
              onClick={(event) => {
                event.preventDefault()
                if (page < totalPages) onPageChange(page + 1)
              }}
              aria-disabled={page >= totalPages}
              className={
                page >= totalPages ? 'pointer-events-none opacity-50' : ''
              }
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  )
}
