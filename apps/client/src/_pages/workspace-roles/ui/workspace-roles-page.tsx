'use client'

import { useWorkspace } from '@/entities/workspace'
import { WorkspaceRolesTable } from '@/widgets/workspace-roles-table'

export function WorkspaceRolesPage() {
  const { id: workspaceId } = useWorkspace()!

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <WorkspaceRolesTable workspaceId={workspaceId} />
    </main>
  )
}
