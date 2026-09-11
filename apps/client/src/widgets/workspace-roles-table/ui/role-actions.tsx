'use client'

import type { WorkspaceRole } from '@/entities/role'
import { Badge } from '@/shared/ui/badge'
import { DeleteWorkspaceRoleButton } from '@/features/delete-workspace-role'
import { UpdateWorkspaceRoleButton } from '@/features/update-workspace-role'

type RoleActionsProps = {
  workspaceId: string
  role: WorkspaceRole
}

export function RoleActions({ workspaceId, role }: RoleActionsProps) {
  if (role.isPredefined) {
    return <Badge variant="secondary">System role</Badge>
  }

  return (
    <div className="flex items-center justify-end gap-2">
      <UpdateWorkspaceRoleButton workspaceId={workspaceId} role={role} />

      <DeleteWorkspaceRoleButton role={role} />
    </div>
  )
}
