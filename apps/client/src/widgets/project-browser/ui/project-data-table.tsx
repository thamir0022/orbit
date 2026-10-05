'use client'

import { useMemo } from 'react'

import {
  type ColumnDef,
  type OnChangeFn,
  type SortingState,
  useTable,
} from '@tanstack/react-table'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/ui/table'

import type { Project } from '@/entities/project/model/project.types'

import { projectTableFeatures } from '../model/project-table-features'

type ProjectColumnDef = ColumnDef<typeof projectTableFeatures, Project>

const COLUMN_WIDTHS = {
  name: 'w-[26%]',
  type: 'w-[11%]',
  status: 'w-[12%]',
  stage: 'w-[13%]',
  priority: 'w-[12%]',
  lead: 'w-[14%]',
  startDate: 'w-[11%]',
  targetEndDate: 'w-[11%]',
} as const

interface ProjectDataTableProps {
  readonly columns: readonly ProjectColumnDef[]
  readonly data: readonly Project[]
  readonly sorting: SortingState
  readonly onSortingChange: OnChangeFn<SortingState>
}

export const ProjectDataTable = ({
  columns,
  data,
  sorting,
  onSortingChange,
}: ProjectDataTableProps) => {
  const tableData = useMemo(() => [...data], [data])

  const table = useTable({
    key: 'projects-table',

    features: projectTableFeatures,

    columns: [...columns],

    data: tableData,

    manualSorting: true,

    enableMultiSort: false,

    state: {
      sorting,
    },

    onSortingChange,
  })

  return (
    <Table className="table-fixed">
      <TableHeader>
        {table.getHeaderGroups().map((headerGroup) => (
          <TableRow key={headerGroup.id}>
            {headerGroup.headers.map((header) => {
              const columnClass =
                COLUMN_WIDTHS[header.column.id as keyof typeof COLUMN_WIDTHS]

              const sorted = header.column.getIsSorted()

              return (
                <TableHead
                  key={header.id}
                  className={columnClass}
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
            {row.getAllCells().map((cell) => {
              const columnClass =
                COLUMN_WIDTHS[cell.column.id as keyof typeof COLUMN_WIDTHS]

              return (
                <TableCell key={cell.id} className={`${columnClass} py-3`}>
                  <table.FlexRender cell={cell} />
                </TableCell>
              )
            })}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
