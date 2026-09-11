import { Building2 } from 'lucide-react'
import { getUserWorkspacesServer } from '@/entities/workspace/api/get-user-workspaces.server'
import {
  AddWorkspaceCard,
  WorkspaceCard,
} from '@/entities/workspace/ui/workspaces-card'
import Link from 'next/link'

export async function WorkspaceSelectionView() {
  // Fetch data on the server. Next.js handles caching automatically.
  const { workspaces } = await getUserWorkspacesServer()

  return (
    <div className="mx-auto w-full">
      <div className="text-2xl text-center">Select Your Workspace</div>
      {workspaces.length > 0 ? (
        <div className="mx-auto max-w-sm mt-10 mx-auto grid grid-cols-2 md:grid-cols-4 gap-3">
          {workspaces.map((workspace) => (
            <WorkspaceCard key={workspace.slug} workspace={workspace} />
          ))}

          <AddWorkspaceCard />
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-24 text-center bg-muted/10">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-4">
            <Building2 className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-xl font-semibold">No workspaces found</h3>
          <p className="mb-6 mt-2 max-w-sm text-sm text-muted-foreground">
            You don't belong to any active workspaces yet. Create your first
            workspace to get started.
          </p>
          <Link
            href="/workspaces/new"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 transition-colors"
          >
            Create Workspace
          </Link>
        </div>
      )}
    </div>
  )
}
