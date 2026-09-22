'use client'

import { createColumnHelper } from '@tanstack/react-table'

import type { WorkspaceRole } from '@/entities/role'
import { Badge } from '@/shared/ui/badge'

import { workspaceRolesTableFeatures } from './data-table-features'
import { RoleActions } from '../ui/role-actions'

type GetWorkspaceRolesColumnsOptions = {
  workspaceId: string
}

const columnHelper = createColumnHelper<
  typeof workspaceRolesTableFeatures,
  WorkspaceRole
>()

export function getWorkspaceRolesColumns({
  workspaceId,
}: GetWorkspaceRolesColumnsOptions) {
  return columnHelper.columns([
    columnHelper.accessor('name', {
      header: 'Role',

      enableGlobalFilter: true,

      cell: ({ getValue }) => <span className="font-medium">{getValue()}</span>,
    }),

    columnHelper.accessor('description', {
      header: 'Description',

      enableGlobalFilter: true,

      cell: ({ getValue }) => {
        return <span>{getValue() ?? '—'}</span>
      },
    }),

    columnHelper.display({
      id: 'type',
      header: 'Type',

      cell: ({ row }) => (
        <Badge variant="secondary">
          {row.original.isPredefined ? 'Predefined' : 'Custom'}
        </Badge>
      ),
    }),

    columnHelper.display({
      id: 'actions',
      header: 'Actions',

      cell: ({ row }) => (
        <RoleActions workspaceId={workspaceId} role={row.original} />
      ),
    }),
  ])
}
