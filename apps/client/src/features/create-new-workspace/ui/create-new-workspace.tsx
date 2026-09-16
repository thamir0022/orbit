import { CreateWorkspaceData } from '@/entities/workspace/model/create-workspace.schema'
import { WorkspaceCreateForm } from '@/widgets/workspace/ui/workspace-create-form'
import { useCreateNewWorkspaceMutation } from '../model/use-create-new-workspace.mutation'
import { toast } from 'sonner'
import { useEffect } from 'react'

interface CreateWorkspaceProps {
  isNewUser: boolean
}

export const CreateWorkspace = ({ isNewUser }: CreateWorkspaceProps) => {
  const { mutate: createNewWorkspace, isPending } =
    useCreateNewWorkspaceMutation()

  useEffect(() => {
    if (!isNewUser) return

    toast('🎉 Create Your First Workspace')
  }, [isNewUser])

  const onSubmit = (data: CreateWorkspaceData) => {
    createNewWorkspace(data)
  }

  return (
    <WorkspaceCreateForm
      title="Create Your New Workspace"
      isLoading={isPending}
      onSubmit={onSubmit}
    />
  )
}
