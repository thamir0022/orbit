import { CreateWorkspaceData } from '@/entities/workspace/model/create-workspace.schema'
import { WorkspaceCreateForm } from '@/widgets/workspace/ui/workspace-create-form'
import { useCreateNewWorkspaceMutation } from '../model/use-create-new-workspace.mutation'

export const CreateWorkspace = () => {
  const { mutate: createNewWorkspace, isPending } =
    useCreateNewWorkspaceMutation()

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
