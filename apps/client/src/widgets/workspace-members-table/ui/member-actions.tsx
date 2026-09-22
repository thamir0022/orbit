'use client'

import type { WorkspaceRole } from '@/entities/role'
import type { WorkspaceMember } from '@/entities/workspace-member'
import { ManageWorkspaceMemberButton } from '@/features/update-workspace-member'

type MemberActionsProps = {
  member: WorkspaceMember
  roles: WorkspaceRole[]
  rolesLoading?: boolean
}

export function MemberActions({
  member,
  roles,
  rolesLoading = false,
}: MemberActionsProps) {
  return (
    <ManageWorkspaceMemberButton
      member={member}
      roles={roles}
      rolesLoading={rolesLoading}
    />
  )
}
