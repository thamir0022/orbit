'use client'

import { useState } from 'react'
import type { Role } from '@/entities/role'
import type { WorkspaceMember } from '@/entities/workspace-member'
import { Button } from '@/shared/ui/button'
import { Dialog, DialogTrigger } from '@/shared/ui/dialog'
import { ManageWorkspaceMemberDialog } from './manage-workspace-member-dialog'
import { LuUserRoundCog } from 'react-icons/lu'

type ManageWorkspaceMemberButtonProps = {
  member: WorkspaceMember
  roles: Role[]
  rolesLoading?: boolean
}

export function ManageWorkspaceMemberButton({
  member,
  roles,
  rolesLoading = false,
}: ManageWorkspaceMemberButtonProps) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={rolesLoading || roles.length === 0}
        >
          <LuUserRoundCog/>
          Manage
        </Button>
      </DialogTrigger>

      <ManageWorkspaceMemberDialog
        member={member}
        roles={roles}
        rolesLoading={rolesLoading}
        onClose={() => setOpen(false)}
      />
    </Dialog>
  )
}
