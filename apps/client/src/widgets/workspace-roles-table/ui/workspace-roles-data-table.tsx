'use client'

import type { ColumnDef, RowData } from '@tanstack/react-table'
import type { Dispatch, ReactNode, SetStateAction } from 'react'
import { useTable } from '@tanstack/react-table'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/ui/table'

import {
  workspaceRolesTableFeatures,
  type WorkspaceRolesTableFeatures,
} from '../model/data-table-features'

type WorkspaceRolesDataTableProps<TData extends RowData> = {
  columns: ColumnDef<WorkspaceRolesTableFeatures, TData>[]
  data: TData[]

  globalFilter: string
  onGlobalFilterChange: Dispatch<SetStateAction<string>>

  emptyState?: ReactNode
}

export function WorkspaceRolesDataTable<TData extends RowData>({
  columns,
  data,
  globalFilter,
  onGlobalFilterChange,
  emptyState,
}: WorkspaceRolesDataTableProps<TData>) {
  const table = useTable({
    features: workspaceRolesTableFeatures,

    data,
    columns,

    globalFilterFn: 'includesString',

    state: {
      globalFilter,
    },

    onGlobalFilterChange,
  })

  const rows = table.getRowModel().rows

  return (
    <div className="overflow-hidden rounded-2xl border">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id} className="h-12">
                  {header.isPlaceholder ? null : (
                    <table.FlexRender header={header} />
                  )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>

        <TableBody>
          {rows.length > 0 ? (
            rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id} className="py-4 align-top">
                    <table.FlexRender cell={cell} />
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-40">
                {emptyState ?? (
                  <div className="flex items-center justify-center text-sm text-muted-foreground">
                    No results.
                  </div>
                )}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
