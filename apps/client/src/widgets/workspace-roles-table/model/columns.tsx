'use client'

import type { ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/shared/ui/badge'
import type { WorkspaceRole } from '@/entities/role'
import { RoleActions } from '../ui/role-actions'

type GetWorkspaceRolesColumnsOptions = {
  workspaceId: string
}

export function getWorkspaceRolesColumns({
  workspaceId,
}: GetWorkspaceRolesColumnsOptions): ColumnDef<WorkspaceRole>[] {
  return [
    {
      accessorKey: 'name',
      header: 'Role',
      cell: ({ row }) => {
        return <span className="font-medium">{row.original.name}</span>
      },
    },
    {
      accessorKey: 'description',
      header: 'Description',
      cell: ({ row }) => {
        return <span>{row.original.description ?? '—'}</span>
      },
    },
    {
      id: 'type',
      header: 'Type',
      cell: ({ row }) => {
        return (
          <Badge variant="secondary">
            {row.original.isPredefined ? 'Predefined' : 'Custom'}
          </Badge>
        )
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <RoleActions workspaceId={workspaceId} role={row.original} />
      ),
    },
  ]
}
