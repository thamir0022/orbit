'use client'

import { useId, useRef, useState } from 'react'
import type { ChangeEvent, DragEvent } from 'react'

import {
  AlertCircle,
  FileAudio,
  FileImage,
  FileText,
  FileVideo,
  Paperclip,
  X,
} from 'lucide-react'

import {
  FILE_ACCEPT,
  formatFileSize,
  MAX_ATTACHMENTS_PER_BATCH,
} from '@/entities/file/lib/file-upload-policy'
import type {
  FileQueueItem,
  FileQueueStatus,
} from '@/entities/file/model/file.types'

import { cn } from '@/shared/lib/utils'
import { Alert, AlertDescription } from '@/shared/ui/alert'
import {
  Attachment,
  AttachmentAction,
  AttachmentActions,
  AttachmentContent,
  AttachmentDescription,
  AttachmentGroup,
  AttachmentMedia,
  AttachmentTitle,
} from '@/shared/ui/attachment'
import { Button } from '@/shared/ui/button'

interface FileUploadFieldProps {
  readonly items: readonly FileQueueItem[]
  readonly errors?: readonly string[]
  readonly disabled?: boolean
  readonly onFilesSelected: (files: File[]) => void
  readonly onRemove: (id: string) => void
}

function getAttachmentState(
  status: FileQueueStatus
): 'idle' | 'uploading' | 'processing' | 'error' | 'done' {
  switch (status) {
    case 'uploading':
      return 'uploading'
    case 'processing':
    case 'attaching':
      return 'processing'
    case 'error':
      return 'error'
    case 'done':
      return 'done'
    default:
      return 'idle'
  }
}

function getFileIcon(mimeType: string) {
  if (mimeType.startsWith('image/')) return FileImage
  if (mimeType.startsWith('video/')) return FileVideo
  if (mimeType.startsWith('audio/')) return FileAudio

  return FileText
}

function getFileStatus(item: FileQueueItem): string {
  switch (item.status) {
    case 'uploading':
      return `Uploading · ${item.progress}%`
    case 'processing':
      return 'Verifying and scanning'
    case 'attaching':
      return 'Attaching to project'
    case 'done':
      return 'Attached'
    case 'error':
      return item.error || 'Upload failed'
    default:
      return 'Ready to upload'
  }
}

/** Reusable multi-file picker with drag-and-drop and upload feedback. */
export function FileUploadField({
  items,
  errors = [],
  disabled = false,
  onFilesSelected,
  onRemove,
}: FileUploadFieldProps) {
  const inputId = useId()
  const inputRef = useRef<HTMLInputElement>(null)
  const dragDepth = useRef(0)

  const [isDragging, setIsDragging] = useState(false)

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? [])

    if (files.length > 0) {
      onFilesSelected(files)
    }

    // Allows selecting the same file again.
    event.target.value = ''
  }

  const handleDragEnter = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    event.stopPropagation()

    if (disabled) return

    dragDepth.current += 1
    setIsDragging(true)
  }

  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    event.stopPropagation()

    event.dataTransfer.dropEffect = disabled ? 'none' : 'copy'
  }

  const handleDragLeave = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    event.stopPropagation()

    dragDepth.current = Math.max(0, dragDepth.current - 1)

    if (dragDepth.current === 0) {
      setIsDragging(false)
    }
  }

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    event.stopPropagation()

    dragDepth.current = 0
    setIsDragging(false)

    if (disabled) return

    const files = Array.from(event.dataTransfer.files)

    if (files.length > 0) {
      onFilesSelected(files)
    }
  }

  return (
    <div className="space-y-3">
      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept={FILE_ACCEPT}
        multiple
        disabled={disabled}
        onChange={handleInputChange}
        className="sr-only"
        aria-label="Select attachment files"
        tabIndex={-1}
      />

      <div
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          'rounded-lg border border-dashed p-3 transition-colors',
          'border-border/70 bg-muted/20',
          isDragging && 'border-primary bg-primary/5',
          disabled && 'opacity-60'
        )}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm font-medium">
              Attachments
              {items.length > 0 && (
                <span className="ml-2 text-muted-foreground">
                  {items.length}/{MAX_ATTACHMENTS_PER_BATCH}
                </span>
              )}
            </p>

            <p className="mt-0.5 text-xs text-muted-foreground">
              Drop files here or use the paperclip
            </p>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            disabled={disabled || items.length >= MAX_ATTACHMENTS_PER_BATCH}
            onClick={() => inputRef.current?.click()}
            aria-label="Add attachments"
            title="Add attachments"
          >
            <Paperclip className="size-4" aria-hidden="true" />
          </Button>
        </div>

        {items.length > 0 && (
          <AttachmentGroup className="mt-3 max-h-44 overflow-y-auto">
            {items.map((item) => {
              const Icon = getFileIcon(item.mimeType)

              return (
                <Attachment
                  key={item.id}
                  state={getAttachmentState(item.status)}
                  size="sm"
                >
                  <AttachmentMedia>
                    <Icon className="size-4" aria-hidden="true" />
                  </AttachmentMedia>

                  <AttachmentContent>
                    <AttachmentTitle title={item.file.name}>
                      {item.file.name}
                    </AttachmentTitle>

                    <AttachmentDescription>
                      {formatFileSize(item.file.size)}
                      {' · '}
                      {getFileStatus(item)}
                    </AttachmentDescription>
                  </AttachmentContent>

                  <AttachmentActions>
                    {item.status !== 'done' && (
                      <AttachmentAction
                        type="button"
                        disabled={disabled}
                        aria-label={`Remove ${item.file.name}`}
                        title={`Remove ${item.file.name}`}
                        onClick={() => onRemove(item.id)}
                      >
                        <X className="size-3.5" aria-hidden="true" />
                      </AttachmentAction>
                    )}
                  </AttachmentActions>
                </Attachment>
              )
            })}
          </AttachmentGroup>
        )}
      </div>

      {errors.length > 0 && (
        <Alert variant="destructive" role="alert">
          <AlertCircle className="size-4" aria-hidden="true" />

          <AlertDescription>
            <ul className="list-disc space-y-1 pl-4">
              {errors.map((message, index) => (
                <li key={`${index}-${message}`}>{message}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}
