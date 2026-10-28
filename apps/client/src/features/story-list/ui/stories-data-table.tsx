'use client'

import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react'
import { useMemo } from 'react'
import { useTable } from '@tanstack/react-table'

import type { Story } from '@/entities/story'
import { Button } from '@/shared/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/ui/table'

import { storyTableFeatures } from '../model/story-table-features'
import { storyTableColumns } from './story-table-columns'

interface StoriesDataTableProps {
  readonly stories: readonly Story[]
}

export function StoriesDataTable({ stories }: StoriesDataTableProps) {
  const data = useMemo(() => [...stories], [stories])
  const table = useTable({
    key: 'orbit-stories-table',
    features: storyTableFeatures,
    columns: storyTableColumns,
    data,
  })

  return (
    <div
      role="region"
      aria-label="Stories table"
      tabIndex={0}
      className="w-full overflow-x-auto rounded-lg border outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow
              key={headerGroup.id}
              className="bg-muted/30 hover:bg-muted/30"
            >
              {headerGroup.headers.map((header) => {
                const sorted = header.column.getIsSorted()
                const canSort = header.column.getCanSort()

                return (
                  <TableHead
                    key={header.id}
                    scope="col"
                    className="h-10 whitespace-nowrap"
                  >
                    {header.isPlaceholder ? null : canSort ? (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="-ml-3 h-8 gap-1.5 px-3 font-medium text-muted-foreground hover:text-foreground"
                        onClick={header.column.getToggleSortingHandler()}
                        aria-label={`Sort by ${String(header.column.columnDef.header)}${sorted === 'asc' ? ', currently ascending' : sorted === 'desc' ? ', currently descending' : ''}`}
                      >
                        <table.FlexRender header={header} />
                        {sorted === 'asc' ? (
                          <ArrowUp aria-hidden="true" className="size-3.5" />
                        ) : sorted === 'desc' ? (
                          <ArrowDown aria-hidden="true" className="size-3.5" />
                        ) : (
                          <ArrowUpDown
                            aria-hidden="true"
                            className="size-3.5 opacity-50"
                          />
                        )}
                      </Button>
                    ) : (
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
                <TableCell key={cell.id} className="h-14 align-middle">
                  <table.FlexRender cell={cell} />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
