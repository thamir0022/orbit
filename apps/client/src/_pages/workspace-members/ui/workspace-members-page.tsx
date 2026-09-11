// import WorkspaceMembersSection from '@/widgets/workspace-members/ui/workspace-members-section'

// const WorkspaceMembersPage = () => {
//   return <WorkspaceMembersSection />
// }

// export default WorkspaceMembersPage

'use client'
import { useWorkspace } from '@/entities/workspace'
import { WorkspaceMembersTable } from '@/widgets/workspace-members-table'

export function WorkspaceMembersPage() {
  const { id: workspaceId } = useWorkspace()!

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <WorkspaceMembersTable workspaceId={workspaceId} />
    </main>
  )
}
