'use client'

import { createColumnHelper } from '@tanstack/react-table'

import type { WorkspaceRole } from '@/entities/role'
import type { WorkspaceMember } from '@/entities/workspace-member'
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui/avatar'
import { Badge } from '@/shared/ui/badge'
import { formatDateTime } from '@/shared/lib/format-date'

import { workspaceMembersTableFeatures } from './data-table-features'
import { MemberActions } from '../ui/member-actions'

type GetWorkspaceMembersColumnsOptions = {
  roles: WorkspaceRole[]
  rolesLoading?: boolean
}

const columnHelper = createColumnHelper<
  typeof workspaceMembersTableFeatures,
  WorkspaceMember
>()

function formatRoleName(value: string): string {
  return value.replaceAll('_', ' ')
}

export function getWorkspaceMembersColumns({
  roles,
  rolesLoading = false,
}: GetWorkspaceMembersColumnsOptions) {
  return columnHelper.columns([
    columnHelper.accessor('displayName', {
      header: 'Member',

      cell: ({ row, getValue }) => {
        const member = row.original
        const displayName = getValue()

        return (
          <div className="flex min-w-0 items-center gap-3">
            <Avatar className="size-8">
              <AvatarImage
                src={member.avatarUrl ?? undefined}
                alt={displayName}
              />

              <AvatarFallback>
                {displayName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{displayName}</p>

              <p className="truncate text-xs text-muted-foreground">
                {member.email}
              </p>
            </div>
          </div>
        )
      },
    }),

    columnHelper.accessor('roleName', {
      header: 'Role',

      cell: ({ getValue }) => {
        const roleName = getValue()

        return (
          <Badge variant="secondary">
            {roleName ? formatRoleName(roleName) : '—'}
          </Badge>
        )
      },
    }),

    columnHelper.accessor('status', {
      header: 'Status',

      cell: ({ getValue }) => {
        const status = getValue()

        return <Badge variant="outline">{status || '—'}</Badge>
      },
    }),

    columnHelper.accessor('joinedAt', {
      header: 'Joined',

      cell: ({ getValue }) => (
        <span className="text-sm text-muted-foreground">
          {formatDateTime(getValue())}
        </span>
      ),
    }),

    columnHelper.display({
      id: 'actions',
      header: 'Actions',

      cell: ({ row }) => (
        <MemberActions
          member={row.original}
          roles={roles}
          rolesLoading={rolesLoading}
        />
      ),
    }),
  ])
}
