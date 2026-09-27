'use client'

import Link from 'next/link'
import { Building2 } from 'lucide-react'

import { useUserWorkspaces } from '@/entities/workspace'

import { AddWorkspaceCard, WorkspaceCard } from './workspaces-card'
import { ScrollArea } from '@/shared/ui/scroll-area'

export function WorkspaceSelectionView() {
  const { data: response, isLoading, isError, error } = useUserWorkspaces()

  const workspaces = response?.data.workspaces ?? []

  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-sm py-20 text-center">
        <p className="text-sm text-muted-foreground">
          Loading your workspaces...
        </p>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="mx-auto w-full max-w-sm py-20 text-center">
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Unable to load workspaces</h3>

          <p className="text-sm text-muted-foreground">
            {error instanceof Error
              ? error.message
              : 'Something went wrong while loading your workspaces.'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="my-[20vh] mx-auto">
      <h1 className="text-center text-2xl font-semibold">
        Select Your Workspace
      </h1>

      {workspaces.length > 0 ? (
        <div className="mx-auto mt-10">
          <ScrollArea className="h-52 w-full">
            <div className="px-4 grid max-w-md grid-cols-3 gap-4 sm:grid-cols-4">
              <>
                {workspaces.map((workspace) => (
                  <WorkspaceCard key={workspace.slug} workspace={workspace} />
                ))}
                <AddWorkspaceCard />
              </>
            </div>
          </ScrollArea>
        </div>
      ) : (
        <div className="mx-auto mt-10 flex max-w-sm flex-col items-center justify-center rounded-xl border border-dashed bg-muted/10 px-6 py-24 text-center">
          <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-primary/10">
            <Building2 className="size-8 text-primary" />
          </div>

          <h3 className="text-xl font-semibold">No workspaces found</h3>

          <p className="mt-2 mb-6 max-w-sm text-sm text-muted-foreground">
            You don't belong to any active workspaces yet. Create your first
            workspace to get started.
          </p>

          <Link
            href="/workspaces/new"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
          >
            Create Workspace
          </Link>
        </div>
      )}
    </div>
  )
}
