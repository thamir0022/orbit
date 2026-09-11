'use client'

import { useState } from 'react'
import { PencilLine } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import type { WorkspaceRole } from '@/entities/role'
import { UpdateWorkspaceRoleDialog } from './update-workspace-role-dialog'

type UpdateWorkspaceRoleButtonProps = {
  workspaceId: string
  role: WorkspaceRole
}

export function UpdateWorkspaceRoleButton({
  workspaceId,
  role,
}: UpdateWorkspaceRoleButtonProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
      >
        <PencilLine className="mr-2 h-4 w-4" />
        Manage
      </Button>

      <UpdateWorkspaceRoleDialog
        workspaceId={workspaceId}
        role={role}
        open={open}
        onOpenChange={setOpen}
      />
    </>
  )
}
