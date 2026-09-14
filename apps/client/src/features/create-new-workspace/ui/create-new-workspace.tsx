import { CreateWorkspaceData } from '@/entities/workspace/model/create-workspace.schema'
import { WorkspaceCreateForm } from '@/widgets/workspace/ui/workspace-create-form'
import { useCreateNewWorkspaceMutation } from '../model/use-create-new-workspace.mutation'
import { toast } from 'sonner'

interface CreateWorkspaceProps {
  isNewUser: boolean
}

export const CreateWorkspace = ({ isNewUser }: CreateWorkspaceProps) => {
  const { mutate: createNewWorkspace, isPending } =
    useCreateNewWorkspaceMutation()

  if (isNewUser) toast('🎉 Create Your First Workspace')

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
