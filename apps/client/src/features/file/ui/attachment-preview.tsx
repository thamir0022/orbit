'use client'

import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import Image from 'next/image'
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
import {
  attachmentKeys,
  attachmentTitle,
  deleteAttachment,
  getFilePreview,
  renameAttachment,
  type AttachmentTargetType,
  type FileAccess,
  type FileAttachment,
} from '@/entities/file/api/file-attachment.api'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Dialog, DialogContent, DialogTitle } from '@/shared/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/shared/ui/alert-dialog'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip'
import { Spinner } from '@/shared/ui/spinner'

function FileMedia({ url, mimeType, fileName }: FileAccess) {
  if (mimeType.startsWith('image/'))
    return (
      <div className="relative h-[60dvh] w-full">
        <Image
          src={url}
          alt={fileName}
          fill
          unoptimized
          sizes="(max-width: 1024px) 100vw, 960px"
          className="object-contain"
        />
      </div>
    )
  if (mimeType.startsWith('video/'))
    return <video src={url} controls className="max-h-[60dvh] w-full" />
  if (mimeType.startsWith('audio/'))
    return <audio src={url} controls className="w-full" />
  if (mimeType === 'application/pdf' || mimeType === 'text/plain')
    return (
      <iframe
        src={url}
        title={fileName}
        className="h-[60dvh] w-full border-0"
      />
    )
  return (
    <p className="py-12 text-center text-sm text-muted-foreground">
      Preview is not available for this file type.
    </p>
  )
}

interface AttachmentPreviewProps {
  readonly attachment: FileAttachment
  readonly targetType: AttachmentTargetType
  readonly targetId: string
  readonly workspaceId: string | undefined
  readonly onClose: () => void
}

export function AttachmentPreview({
  attachment,
  targetType,
  targetId,
  workspaceId,
  onClose,
}: AttachmentPreviewProps) {
  const queryClient = useQueryClient()
  const [isEditing, setIsEditing] = useState(false)
  const [title, setTitle] = useState(attachmentTitle(attachment))
  const [confirmDelete, setConfirmDelete] = useState(false)
  const accessKey = [
    'files',
    'access',
    workspaceId,
    attachment.fileId,
    attachment.id,
  ] as const
  const preview = useQuery({
    queryKey: accessKey,
    queryFn: () => getFilePreview(attachment.fileId, attachment.id),
    gcTime: 0,
    retry: false,
  })
  const rename = useMutation({
    mutationFn: () => renameAttachment(attachment, title.trim()),
    onSuccess: () => setIsEditing(false),
    onSettled: () =>
      queryClient.invalidateQueries({
        queryKey: attachmentKeys.target(targetType, targetId),
      }),
  })
  const remove = useMutation({
    mutationFn: () => deleteAttachment(attachment.id),
    onSuccess: async () => {
      await queryClient.cancelQueries({ queryKey: accessKey })
      queryClient.removeQueries({ queryKey: accessKey })
      onClose()
      await queryClient.invalidateQueries({
        queryKey: attachmentKeys.target(targetType, targetId),
      })
    },
  })
  const isBusy = rename.isPending || remove.isPending
  const validTitle =
    title.trim().length > 0 &&
    title.trim().length <= 255 &&
    !/\p{Cc}/u.test(title)
  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open && !isBusy) onClose()
      }}
    >
      <DialogContent
        aria-describedby={undefined}
        showCloseButton={!isBusy}
        className="w-full max-w-[calc(100vw-2rem)] gap-4 rounded-xl p-4 sm:max-w-5xl"
      >
        <div className="flex min-w-0 items-start justify-between gap-3 pr-9">
            <DialogTitle className="truncate text-base">
              {attachmentTitle(attachment)}
            </DialogTitle>
          <DropdownMenu>
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenuTrigger asChild>
                  <Button
                    type="button"
                    size="icon-sm"
                    variant="ghost"
                    disabled={isBusy}
                    aria-label="Attachment actions"
                  >
                    <MoreHorizontal className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
              </TooltipTrigger>
              <TooltipContent>Attachment actions</TooltipContent>
            </Tooltip>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onSelect={() => {
                  setTitle(attachmentTitle(attachment))
                  rename.reset()
                  setIsEditing(true)
                }}
              >
                <Pencil className="size-4" />
                Edit title
              </DropdownMenuItem>
              <DropdownMenuItem
                variant="destructive"
                onSelect={() => {
                  remove.reset()
                  setConfirmDelete(true)
                }}
              >
                <Trash2 className="size-4" />
                Delete attachment
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        {isEditing && (
          <div className="flex flex-wrap items-center gap-2">
            <Input
              aria-label="Attachment title"
              autoFocus
              maxLength={255}
              value={title}
              disabled={rename.isPending}
              onChange={(event) => setTitle(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault()
                  if (validTitle && !isBusy) rename.mutate()
                }
              }}
              className="min-w-40 flex-1"
            />
            <Button
              type="button"
              size="sm"
              disabled={!validTitle || isBusy}
              onClick={() => rename.mutate()}
            >
              {rename.isPending ? 'Saving…' : 'Save'}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              disabled={isBusy}
              onClick={() => {
                setIsEditing(false)
                rename.reset()
              }}
            >
              Cancel
            </Button>
          </div>
        )}
        {rename.isError && (
          <p role="alert" className="text-sm text-destructive">
            Unable to save the title. The attachment may have changed; review it
            and retry.
          </p>
        )}
        {preview.isPending ? (
          <div
            role="status"
            aria-label="Loading preview"
            className="flex h-64 items-center justify-center"
          >
            <Spinner className="size-5" />
          </div>
        ) : preview.isError ? (
          <p
            role="alert"
            className="py-12 text-center text-sm text-destructive"
          >
            Unable to load file preview.
          </p>
        ) : (
          <FileMedia {...preview.data} fileName={attachmentTitle(attachment)} />
        )}
        <AlertDialog
          open={confirmDelete}
          onOpenChange={(open) => {
            if (!remove.isPending) setConfirmDelete(open)
          }}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete attachment?</AlertDialogTitle>
              <AlertDialogDescription>
                Remove “{attachmentTitle(attachment)}” from this{' '}
                {targetType === 'project' ? 'project' : 'item'}? Attachments
                using the same file elsewhere will remain available.
              </AlertDialogDescription>
            </AlertDialogHeader>
            {remove.isError && (
              <p role="alert" className="text-sm text-destructive">
                Unable to delete this attachment. Please retry.
              </p>
            )}
            <AlertDialogFooter>
              <AlertDialogCancel type="button" disabled={remove.isPending}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                type="button"
                variant="destructive"
                disabled={remove.isPending}
                onClick={(event) => {
                  event.preventDefault()
                  remove.mutate()
                }}
              >
                {remove.isPending ? 'Deleting…' : 'Delete attachment'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </DialogContent>
    </Dialog>
  )
}
