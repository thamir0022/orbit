import { CreateWorkspaceData } from '@/entities/workspace/model/create-workspace.schema'
import { WorkspaceCreateForm } from '@/widgets/workspace/ui/workspace-create-form'

export const CreateWorkspace = () => {
  const onSubmit = (data: CreateWorkspaceData) => {
    console.log(data)
  }

  return (
    <WorkspaceCreateForm
      title="Create Your New Workspace"
      isLoading={false}
      onSubmit={onSubmit}
    />
  )
}
