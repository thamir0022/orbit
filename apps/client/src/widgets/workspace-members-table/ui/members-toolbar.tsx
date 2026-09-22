'use client'

import type { WorkspaceRole } from '@/entities/role'
import { InviteMemberDialog } from '@/features/invite-member'
import { FilterWorkspaceMembersByRole } from '@/features/filter-workspace-members-by-role'
import { FilterWorkspaceMembersByStatus } from '@/features/filter-workspace-members-by-status'
import { SearchWorkspaceMembers } from '@/features/search-workspace-members'
import { Button } from '@/shared/ui/button'

type MembersToolbarProps = {
  workspaceId: string
  searchValue: string
  statusValue: string
  roleValue: string
  roles: WorkspaceRole[]
  rolesLoading?: boolean
  onSearchChange: (value: string) => void
  onStatusChange: (value: string) => void
  onRoleChange: (value: string) => void
  onClearFilters: () => void
  showClearFilters: boolean
}

export function MembersToolbar({
  searchValue,
  statusValue,
  roleValue,
  roles,
  rolesLoading = false,
  onSearchChange,
  onStatusChange,
  onRoleChange,
  onClearFilters,
  showClearFilters,
}: MembersToolbarProps) {
  return (
    <div className="space-y-4 rounded-2xl border p-4">
      <div className="grid gap-3 items-center lg:grid-cols-[1.5fr_1fr_1fr_auto]">
        <SearchWorkspaceMembers value={searchValue} onChange={onSearchChange} />

        <FilterWorkspaceMembersByStatus
          value={statusValue}
          onChange={onStatusChange}
        />

        <FilterWorkspaceMembersByRole
          value={roleValue}
          roles={roles}
          isLoading={rolesLoading}
          onChange={onRoleChange}
        />

        <div className="flex items-stretch gap-3">
          {showClearFilters ? (
            <Button variant="outline" className="h-11" onClick={onClearFilters}>
              Clear filters
            </Button>
          ) : null}

          <InviteMemberDialog />
        </div>
      </div>
    </div>
  )
}
