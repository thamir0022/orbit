'use client'

import { useState } from 'react'
import type { FileAttachmentTarget } from '@/entities/file/model/file.types'
import { useFileUploadQueue } from '@/features/file-upload/model/use-file-upload-queue'
import { FileUploadField } from '@/features/file-upload/ui/file-upload-field'
import { Button } from '@/shared/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog'
import { Spinner } from '@/shared/ui/spinner'

export function AddAttachmentsDialog({
  target,
  onClose,
}: {
  readonly target: FileAttachmentTarget
  readonly onClose: () => void
}) {
  const queue = useFileUploadQueue()
  const [message, setMessage] = useState('')
  async function upload() {
    setMessage('')
    try {
      const result = await queue.uploadAll(target)
      if (result.failed === 0) onClose()
      else
        setMessage(
          `${result.failed} attachment${result.failed === 1 ? '' : 's'} could not be added. Review the errors and retry.`
        )
    } catch {
      setMessage('Unable to add attachments. Please retry.')
    }
  }
  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open && !queue.isUploading) onClose()
      }}
    >
      <DialogContent
        showCloseButton={!queue.isUploading}
        className="max-h-[90dvh] min-w-0 overflow-y-auto sm:max-w-xl"
      >
        <DialogHeader>
          <DialogTitle>Add attachments</DialogTitle>
          <DialogDescription>
            Choose files and edit their titles before adding them.
          </DialogDescription>
        </DialogHeader>
        <FileUploadField
          items={queue.items}
          errors={queue.validationErrors}
          disabled={queue.isUploading}
          onFilesSelected={queue.addFiles}
          onRemove={queue.removeFile}
          onTitleChange={queue.renameFile}
        />
        <p role="status" className="text-sm text-destructive">
          {message}
        </p>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            disabled={queue.isUploading}
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            type="button"
            disabled={
              queue.isUploading ||
              !queue.items.some((item) => item.status !== 'done')
            }
            onClick={() => void upload()}
          >
            {queue.isUploading && <Spinner className="size-4" />}
            {queue.isUploading ? 'Adding attachments…' : 'Add attachments'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
