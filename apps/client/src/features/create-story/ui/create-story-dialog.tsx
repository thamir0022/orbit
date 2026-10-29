'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useCreateStoryMutation } from '../model/use-create-story.mutation'
import { Plus } from 'lucide-react'
import { StoryForm } from '@/features/story-form/ui/story-form'
import { Button } from '@/shared/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from '@/shared/ui/dialog'
export function CreateStoryDialog({
  teamKey,
  workspaceSlug,
}: {
  teamKey: string
  workspaceSlug: string
}) {
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const mutation = useCreateStoryMutation(teamKey)
  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        if (!mutation.isPending) setOpen(value)
      }}
    >
      <DialogTrigger render={<Button size="sm" variant="ghost" />}>
        <Plus aria-hidden="true" className="size-4" />
        Create story
      </DialogTrigger>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create story</DialogTitle>
          <DialogDescription>
            Plan the next piece of work for {teamKey}.
          </DialogDescription>
        </DialogHeader>
        <StoryForm
          pending={mutation.isPending}
          onSave={async (input) => {
            const story = await mutation.mutateAsync(input)
            setOpen(false)
            router.push(
              '/' +
                workspaceSlug +
                '/teams/' +
                teamKey +
                '/stories/' +
                story.key
            )
          }}
        />
      </DialogContent>
    </Dialog>
  )
}
