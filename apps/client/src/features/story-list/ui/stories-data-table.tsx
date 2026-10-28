'use client'

import { useMemo } from 'react'
import {
  type OnChangeFn,
  type SortingState,
  useTable,
} from '@tanstack/react-table'

import type { Story } from '@/entities/story'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/ui/table'

import { storyTableFeatures } from '../model/story-table-features'
import { StoryCard } from './story-card'
import { createStoryColumns } from './story-table-columns'

interface StoriesDataTableProps {
  readonly stories: readonly Story[]
  readonly sorting: SortingState
  readonly onSortingChange: OnChangeFn<SortingState>
}

export function StoriesDataTable({
  stories,
  sorting,
  onSortingChange,
}: StoriesDataTableProps) {
  const data = useMemo(() => [...stories], [stories])
  const columns = useMemo(() => createStoryColumns(), [])

  const table = useTable({
    key: 'orbit-stories-table',
    features: storyTableFeatures,
    columns,
    data,
    manualSorting: true,
    enableMultiSort: false,
    state: {
      sorting,
    },
    onSortingChange,
  })

  return (
    <div className="w-full">
      <div className="hidden md:block">
        <Table className="min-w-240 table-fixed">
          <TableCaption className="sr-only">
            Team stories. Select a column heading to sort the table.
          </TableCaption>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow
                key={headerGroup.id}
                className="bg-muted/30 hover:bg-muted/30"
              >
                {headerGroup.headers.map((header) => {
                  const sorted = header.column.getIsSorted()

                  return (
                    <TableHead
                      key={header.id}
                      scope="col"
                      className="h-11 whitespace-nowrap"
                      aria-sort={
                        sorted === 'asc'
                          ? 'ascending'
                          : sorted === 'desc'
                            ? 'descending'
                            : 'none'
                      }
                    >
                      {header.isPlaceholder ? null : (
                        <table.FlexRender header={header} />
                      )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.map((row) => (
              <TableRow key={row.id} className="group">
                {row.getAllCells().map((cell) => (
                  <TableCell key={cell.id} className="py-3">
                    <table.FlexRender cell={cell} />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div aria-label="Stories" className="space-y-2 p-3 md:hidden">
        {table.getRowModel().rows.map((row) => (
          <StoryCard key={row.id} story={row.original} />
        ))}
      </div>
    </div>
  )
}
