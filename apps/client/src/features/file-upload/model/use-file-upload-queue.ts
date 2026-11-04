'use client'

import { useCallback, useRef, useState } from 'react'

import { useMutation, useQueryClient } from '@tanstack/react-query'

import {
  attachFile,
  completeFileUpload,
  getFileUploadStatus,
  initiateFileUpload,
  uploadToStorage,
} from '@/entities/file/api/file.api'
import {
  MAX_ATTACHMENTS_PER_BATCH,
  validateAttachmentFile,
} from '@/entities/file/lib/file-upload-policy'
import type {
  FileAttachmentTarget,
  FileQueueItem,
  FileQueueStage,
} from '@/entities/file/model/file.types'

const MAX_CONCURRENT_UPLOADS = 2
const STATUS_POLL_INTERVAL_MS = 1500
const MAX_STATUS_CHECKS = 80

interface UploadSummary {
  readonly succeeded: number
  readonly failed: number
}

/** Indicates a rejected upload that requires a fresh upload session. */
class RejectedFileError extends Error {}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Unable to upload this file.'
}

function wait(milliseconds: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, milliseconds)
  })
}

/** Polls server-side verification without treating S3 upload as completion. */
async function waitForFileReady(uploadSessionId: string): Promise<void> {
  for (let attempt = 0; attempt < MAX_STATUS_CHECKS; attempt += 1) {
    const status = await getFileUploadStatus(uploadSessionId)

    if (status.fileStatus === 'ready') return

    if (
      status.fileStatus === 'rejected' ||
      status.fileStatus === 'failed' ||
      status.fileStatus === 'deleted'
    ) {
      throw new RejectedFileError(
        'The server rejected or could not process this file.'
      )
    }

    if (attempt < MAX_STATUS_CHECKS - 1) {
      await wait(STATUS_POLL_INTERVAL_MS)
    }
  }

  throw new Error(
    'File processing is taking longer than expected. Retry to check its status.'
  )
}

/** Manages validation, queued files, uploads, verification and attachment. */
export function useFileUploadQueue() {
  const queryClient = useQueryClient()

  const [items, setItems] = useState<FileQueueItem[]>([])
  const [validationErrors, setValidationErrors] = useState<string[]>([])

  const itemsRef = useRef<FileQueueItem[]>([])

  const updateItems = useCallback(
    (updater: (current: FileQueueItem[]) => FileQueueItem[]) => {
      const updated = updater(itemsRef.current)

      itemsRef.current = updated
      setItems(updated)
    },
    []
  )

  const updateItem = useCallback(
    (id: string, changes: Partial<FileQueueItem>) => {
      updateItems((current) =>
        current.map((item) => (item.id === id ? { ...item, ...changes } : item))
      )
    },
    [updateItems]
  )

  const addFiles = useCallback(
    (files: readonly File[]) => {
      const next = [...itemsRef.current]
      const errors: string[] = []

      for (const file of files) {
        if (next.length >= MAX_ATTACHMENTS_PER_BATCH) {
          errors.push(
            `A maximum of ${MAX_ATTACHMENTS_PER_BATCH} files can be attached at once.`
          )
          break
        }

        const duplicate = next.some(
          (item) =>
            item.file.name === file.name &&
            item.file.size === file.size &&
            item.file.lastModified === file.lastModified
        )

        if (duplicate) continue

        const result = validateAttachmentFile(file)

        if (!result.success) {
          errors.push(result.message)
          continue
        }

        next.push({
          id: crypto.randomUUID(),
          file,
          mimeType: result.data.mimeType,
          status: 'queued',
          stage: 'new',
          progress: 0,
        })
      }

      updateItems(() => next)
      setValidationErrors(errors)
    },
    [updateItems]
  )

  const removeFile = useCallback(
    (id: string) => {
      updateItems((current) =>
        current.filter((item) => item.id !== id || item.status === 'done')
      )

      setValidationErrors([])
    },
    [updateItems]
  )

  const processFile = useCallback(
    async (
      item: FileQueueItem,
      target: FileAttachmentTarget
    ): Promise<boolean> => {
      let stage: FileQueueStage = item.stage
      let fileId = item.fileId
      let uploadSessionId = item.uploadSessionId

      try {
        if (stage === 'new') {
          updateItem(item.id, {
            status: 'uploading',
            progress: 0,
            error: '',
          })

          const grant = await initiateFileUpload({
            scope: 'workspace',
            purpose: 'attachment',
            originalName: item.file.name,
            mimeType: item.mimeType,
            sizeBytes: item.file.size,
            targetType: target.targetType,
            targetId: target.targetId,
          })

          fileId = grant.fileId
          uploadSessionId = grant.uploadSessionId

          await uploadToStorage({
            file: item.file,
            upload: grant,
            onProgress: (progress) => {
              updateItem(item.id, { progress })
            },
          })

          await completeFileUpload(uploadSessionId)

          stage = 'processing'

          updateItem(item.id, {
            fileId,
            uploadSessionId,
            stage,
            status: 'processing',
            progress: 100,
          })
        }

        if (stage === 'processing') {
          if (!uploadSessionId) {
            throw new Error('Upload session is missing.')
          }

          updateItem(item.id, {
            status: 'processing',
            error: '',
          })

          await waitForFileReady(uploadSessionId)

          stage = 'ready'

          updateItem(item.id, { stage })
        }

        if (!fileId) {
          throw new Error('Uploaded file ID is missing.')
        }

        updateItem(item.id, {
          status: 'attaching',
          error: '',
        })

        await attachFile({
          fileId,
          targetType: target.targetType,
          targetId: target.targetId,
          placement: 'attachment',
        })

        updateItem(item.id, {
          status: 'done',
          stage: 'ready',
          progress: 100,
          error: '',
        })

        return true
      } catch (error: unknown) {
        const rejected = error instanceof RejectedFileError

        updateItem(item.id, {
          status: 'error',
          stage: rejected ? 'new' : stage,
          error: getErrorMessage(error),
        })

        return false
      }
    },
    [updateItem]
  )

  const uploadMutation = useMutation({
    mutationFn: async (
      target: FileAttachmentTarget
    ): Promise<UploadSummary> => {
      const pending = itemsRef.current.filter((item) => item.status !== 'done')

      if (pending.length === 0) {
        return { succeeded: 0, failed: 0 }
      }

      let index = 0

      const worker = async (): Promise<number> => {
        let succeeded = 0

        while (index < pending.length) {
          const item = pending[index]
          index += 1

          if (item && (await processFile(item, target))) {
            succeeded += 1
          }
        }

        return succeeded
      }

      const workers = Array.from(
        { length: Math.min(MAX_CONCURRENT_UPLOADS, pending.length) },
        () => worker()
      )

      const results = await Promise.all(workers)
      const succeeded = results.reduce((sum, count) => sum + count, 0)

      return {
        succeeded,
        failed: pending.length - succeeded,
      }
    },

    onSuccess: async (summary, target) => {
      if (summary.succeeded > 0) {
        await queryClient.invalidateQueries({
          queryKey: ['attachments', target.targetType, target.targetId],
        })
      }
    },
  })

  const resetQueue = useCallback(() => {
    updateItems(() => [])
    setValidationErrors([])
    uploadMutation.reset()
  }, [updateItems, uploadMutation.reset])

  return {
    items,
    validationErrors,
    addFiles,
    removeFile,
    resetQueue,
    uploadAll: uploadMutation.mutateAsync,
    isUploading: uploadMutation.isPending,
  }
}
