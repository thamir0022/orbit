'use client'

import { type ColumnDef, type RowData, useTable } from '@tanstack/react-table'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/ui/table'

import {
  workspaceMembersTableFeatures,
  type WorkspaceMembersTableFeatures,
} from '../model/data-table-features'

type WorkspaceMembersDataTableProps<TData extends RowData> = {
  columns: ColumnDef<WorkspaceMembersTableFeatures, TData>[]
  data: TData[]
}

export function WorkspaceMembersDataTable<TData extends RowData>({
  columns,
  data,
}: WorkspaceMembersDataTableProps<TData>) {
  const table = useTable({
    features: workspaceMembersTableFeatures,
    data,
    columns,
  })

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
          {table.getRowModel().rows.length > 0 ? (
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id} className="py-4">
                    <table.FlexRender cell={cell} />
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className="h-24 text-center text-sm text-muted-foreground"
              >
                No members found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
