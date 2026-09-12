'use client'

import { Input } from '@/shared/ui/input'
import { Button } from '@/shared/ui/button'
import { CreateWorkspaceRoleDialog } from '@/features/create-workspace-role'

type RolesToolbarProps = {
  workspaceId: string
  searchValue: string
  onSearchChange: (value: string) => void
  onClearSearch: () => void
  showClearSearch: boolean
}

export function RolesToolbar({
  workspaceId,
  searchValue,
  onSearchChange,
  onClearSearch,
  showClearSearch,
}: RolesToolbarProps) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border p-4 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex flex-1 items-center gap-3">
        <Input
          value={searchValue}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search roles"
          type="search"
          className="max-w-xl"
        />

        {showClearSearch ? (
          <Button type="button" variant="outline" onClick={onClearSearch}>
            Clear
          </Button>
        ) : null}
      </div>

      <CreateWorkspaceRoleDialog workspaceId={workspaceId} />
    </div>
  )
}
