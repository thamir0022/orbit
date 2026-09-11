'use client'

import type { ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/shared/ui/badge'
import type { Role } from '@/entities/role'
import type { WorkspaceMember } from '@/entities/workspace-member'
import { formatDateTime } from '@/shared/lib/format-date'
import { MemberActions } from '../ui/member-actions'
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui/avatar'

function prettifyRoleName(value: string): string {
  return value.replaceAll('_', ' ')
}

type GetWorkspaceMembersColumnsOptions = {
  roles: Role[]
  rolesLoading?: boolean
}

export function getWorkspaceMembersColumns({
  roles,
  rolesLoading = false,
}: GetWorkspaceMembersColumnsOptions): ColumnDef<WorkspaceMember>[] {
  return [
    {
      accessorKey: 'displayName',
      header: 'Member',
      cell: ({ row }) => {
        const member = row.original

        return (
          <div className='flex gap-2'>
            <Avatar>
              <AvatarImage/>
              <AvatarFallback>{member.displayName[0]}</AvatarFallback>
            </Avatar>
            <div className="flex min-w-0 flex-col">
              <span className="truncate font-medium text-left">{member.displayName}</span>
              <span className="truncate text-sm text-left">{member.email}</span>
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: 'roleName',
      header: 'Role',
      cell: ({ row }) => {
        const roleName = row.original.roleName || '—'

        return <Badge variant="secondary">{prettifyRoleName(roleName)}</Badge>
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.original.status || '—'

        return <Badge variant="outline">{status}</Badge>
      },
    },
    {
      accessorKey: 'joinedAt',
      header: 'Joined',
      cell: ({ row }) => {
        return (
          <span className="text-sm">
            {formatDateTime(row.original.joinedAt)}
          </span>
        )
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <MemberActions
          member={row.original}
          roles={roles}
          rolesLoading={rolesLoading}
        />
      ),
    },
  ]
}
