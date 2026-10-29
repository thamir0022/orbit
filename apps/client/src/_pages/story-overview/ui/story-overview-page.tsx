'use client'
import { useState } from 'react'
import { MoreHorizontal, Trash2 } from 'lucide-react'
import { BackButton } from '@/shared/ui/back-button'
import { useStoryEditor } from '@/features/edit-story/model/use-story-editor'
import { useTeamRoute } from '@/widgets/team-route'
import { StoryForm } from '@/features/story-form/ui/story-form'
import { Button } from '@/shared/ui/button'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/shared/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/shared/ui/alert-dialog'
export function StoryOverviewPage({ storyKey }: { storyKey: string }) {
  const {
    workspaceId,
    workspaceSlug,
    teamKey,
    team,
    isWorkspaceMismatch,
    isTeamError,
    retryTeam,
  } = useTeamRoute()
  const [confirm, setConfirm] = useState(false)
  const { query, update, remove, listPath } = useStoryEditor({
    workspaceId,
    workspaceSlug,
    teamKey,
    storyKey,
    enabled: !!workspaceId && !!team && !isWorkspaceMismatch,
  })
  if (isWorkspaceMismatch)
    return (
      <p role="alert" className="p-6">
        Switch to the workspace for this story.
      </p>
    )
  if (isTeamError)
    return (
      <div role="alert" className="space-y-4 p-6">
        <p>Unable to load this team.</p>
        <Button onClick={() => void retryTeam()} variant="outline">
          Try again
        </Button>
      </div>
    )
  if (query.isPending)
    return (
      <p role="status" className="p-6">
        Loading story…
      </p>
    )
  if (query.isError || !query.data)
    return (
      <div role="alert" className="space-y-4 p-6">
        <p>Unable to load this story.</p>
        <Button variant="outline" onClick={() => void query.refetch()}>
          Try again
        </Button>
      </div>
    )
  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-8">
      <header className="mb-8 flex items-center justify-between gap-4 border-b pb-4">
        <div className="flex min-w-0 items-center gap-3">
          <BackButton title="Stories" fallbackHref={listPath} />
          <span className="text-sm text-muted-foreground">{storyKey}</span>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="icon" variant="ghost" aria-label="Story actions">
              <MoreHorizontal aria-hidden="true" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onSelect={() => setConfirm(true)}
              className="text-destructive"
            >
              <Trash2 aria-hidden="true" />
              Delete story
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>
      <h1 className="mb-6 break-words text-2xl font-semibold tracking-tight">
        {query.data.title}
      </h1>
      <StoryForm
        key={query.data.id}
        story={query.data}
        pending={update.isPending}
        onSave={async (input) => {
          await update.mutateAsync(input)
        }}
      />
      <AlertDialog
        open={confirm}
        onOpenChange={(value) => {
          if (!remove.isPending) setConfirm(value)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {storyKey}?</AlertDialogTitle>
            <AlertDialogDescription>
              This story will be removed from the team’s active stories.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {remove.error ? (
            <p role="alert" className="text-sm text-destructive">
              {remove.error.message}
            </p>
          ) : null}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={remove.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={remove.isPending || update.isPending}
              onClick={(event) => {
                event.preventDefault()
                remove.mutate()
              }}
            >
              {remove.isPending ? 'Deleting…' : 'Delete story'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  )
}
