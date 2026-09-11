import { Button } from '@/shared/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/ui/dialog'
import { LuUserRoundPlus } from 'react-icons/lu'
import { InviteMemberForm } from './invite-member-form'
import { useWorkspaceRoles } from '@/entities/role'
import { useWorkspace } from '@/entities/workspace'
import { useInviteMemberMutation } from '../model/use-invite-member'
import { InviteMemberFormData } from '../model/invite-member.schema'
import { toast } from 'sonner'
import { useState } from 'react'

export const InviteMemberDialog = () => {
  const [dialogOpen, setDialogOpen] = useState<boolean>(false)
  const { id: workspaceId } = useWorkspace()!

  const {
    data: roles = [],
    isLoading: rolesLoading,
    error: rolesQueryError,
  } = useWorkspaceRoles(workspaceId, 'assignable')

  const inviteMutation = useInviteMemberMutation(workspaceId)

  if (rolesQueryError) console.log(rolesQueryError)

  const handleSubmit = async (formData: InviteMemberFormData) => {
    const res = await inviteMutation.mutateAsync({
      email: formData.email,
      roleId: formData.roleId,
    })

    toast(res.message)
    setDialogOpen(false)
  }

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button>
          <LuUserRoundPlus />
          Invite
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-center">Invite New Member</DialogTitle>
        </DialogHeader>

        <InviteMemberForm
          roles={roles}
          onSubmit={handleSubmit}
          rolesError={rolesQueryError?.message}
          errorMessage={inviteMutation.error?.message}
          isSubmitting={inviteMutation.isPending}
          rolesLoading={rolesLoading}
        />

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" type="submit">
              Cancel
            </Button>
          </DialogClose>
          <Button
            type="submit"
            isLoading={inviteMutation.isPending}
            form="invite-member-form"
          >
            Invite
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
