'use client'

import { CreateWorkspace } from '@/features/create-new-workspace'

interface CreateWorkspacePageProps {
  isNewuser: boolean
}

export const CreateWorkspacePage = ({
  isNewuser,
}: CreateWorkspacePageProps) => {
  return <CreateWorkspace isNewUser={isNewuser} />
}
