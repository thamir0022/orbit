'use client'

import type { Role } from '@/entities/role'
import type { WorkspaceMember } from '@/entities/workspace-member'
import {
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog'
import { useUpdateWorkspaceMemberMutation } from '../model/use-update-workspace-member'
import type { UpdateWorkspaceMemberFormValues } from '../model/update-workspace-member.schema'
import { ManageWorkspaceMemberForm } from './manage-workspace-member-form'
import { useState } from 'react'

type ManageWorkspaceMemberDialogProps = {
  member: WorkspaceMember
  roles: Role[]
  rolesLoading?: boolean
  onClose: () => void
}

export function ManageWorkspaceMemberDialog({
  member,
  roles,
  rolesLoading = false,
  onClose,
}: ManageWorkspaceMemberDialogProps) {
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const updateMemberMutation = useUpdateWorkspaceMemberMutation()

  async function handleSubmit(values: UpdateWorkspaceMemberFormValues) {
    setErrorMessage(null)

    try {
      await updateMemberMutation.mutateAsync({
        memberId: member.userId,
        input: values,
      })

      onClose()
    } catch (error: unknown) {}
  }

  return (
    <DialogContent className="sm:max-w-2xl">
      <DialogHeader>
        <DialogTitle>Manage member</DialogTitle>
        <DialogDescription>
          Update {member.displayName}'s role and status.
        </DialogDescription>
      </DialogHeader>

      <ManageWorkspaceMemberForm
        member={member}
        roles={roles}
        rolesLoading={rolesLoading}
        isSubmitting={updateMemberMutation.isPending}
        errorMessage={errorMessage}
        onSubmit={handleSubmit}
        onCancel={onClose}
        modalClose={onClose}
      />
    </DialogContent>
  )
}
