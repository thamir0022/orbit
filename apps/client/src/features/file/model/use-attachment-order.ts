'use client'

import { useEffect, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  attachmentKeys,
  reorderAttachments,
  type AttachmentTargetType,
  type FileAttachment,
} from '@/entities/file/api/file-attachment.api'

/** Keeps drag feedback local and saves one revision-checked order after interaction ends. */
export function useAttachmentOrder(
  attachments: readonly FileAttachment[],
  targetType: AttachmentTargetType,
  targetId: string,
  workspaceId: string | undefined
) {
  const queryClient = useQueryClient()
  const [draft, setDraft] = useState<readonly FileAttachment[] | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const mutation = useMutation({
    mutationFn: (items: readonly FileAttachment[]) =>
      reorderAttachments(targetType, targetId, items),
    onSuccess: (_, items) => {
      queryClient.setQueryData(
        attachmentKeys.list(targetType, targetId, workspaceId),
        items.map((item, position) => ({
          ...item,
          position,
          revision: item.revision + 1,
        }))
      )
    },
    onSettled: async () => {
      setDraft(null)
      await queryClient.invalidateQueries({
        queryKey: attachmentKeys.target(targetType, targetId),
      })
    },
  })
  const { mutate, isPending } = mutation
  useEffect(() => {
    if (!draft || isDragging || isPending) return
    if (draft.every((item, index) => item.id === attachments[index]?.id)) return
    const timer = setTimeout(() => mutate(draft), 400)
    return () => clearTimeout(timer)
  }, [draft, attachments, isDragging, isPending, mutate])

  const items = draft ?? attachments
  function reorder(ids: string[]) {
    if (isPending) return
    const byId = new Map(items.map((item) => [item.id, item]))
    if (ids.length !== items.length || ids.some((id) => !byId.has(id))) return
    mutation.reset()
    setDraft(
      ids.every((id, index) => id === attachments[index]?.id)
        ? null
        : ids.map((id) => byId.get(id)!)
    )
  }

  return {
    items,
    reorder,
    setIsDragging,
    isSaving: isPending,
    hasDraft: draft !== null,
    error: mutation.error,
    isSaved: mutation.isSuccess,
  }
}
