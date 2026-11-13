'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Reorder } from 'motion/react'
import { Plus } from 'lucide-react'
import {
  attachmentKeys,
  getAttachments,
  type AttachmentTargetType,
  type FileAttachment,
} from '@/entities/file/api/file-attachment.api'
import { useWorkspace } from '@/entities/workspace/model/workspace.store'
import { Button } from '@/shared/ui/button'
import { Spinner } from '@/shared/ui/spinner'
import { TooltipProvider } from '@/shared/ui/tooltip'
import { useAttachmentOrder } from '../model/use-attachment-order'
import { AttachmentPill } from './attachment-pill'
import { AttachmentPreview } from './attachment-preview'
import { AddAttachmentsDialog } from './add-attachments-dialog'

interface AttachmentListProps {
  readonly targetType: AttachmentTargetType
  readonly targetId: string
}
const EMPTY_ATTACHMENTS: readonly FileAttachment[] = []

export function AttachmentList(props: AttachmentListProps) {
  const workspace = useWorkspace()
  return (
    <AttachmentCollection
      key={`${workspace?.id}:${props.targetType}:${props.targetId}`}
      {...props}
      workspaceId={workspace?.id}
    />
  )
}

function AttachmentCollection({
  targetType,
  targetId,
  workspaceId,
}: AttachmentListProps & { readonly workspaceId: string | undefined }) {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [isAdding, setIsAdding] = useState(false)
  const query = useQuery({
    queryKey: attachmentKeys.list(targetType, targetId, workspaceId),
    queryFn: () => getAttachments(targetType, targetId),
    enabled: !!workspaceId,
    refetchOnWindowFocus: false,
  })
  const order = useAttachmentOrder(
    query.data ?? EMPTY_ATTACHMENTS,
    targetType,
    targetId,
    workspaceId
  )
  const selected = query.data?.find((item) => item.id === selectedId)

  function move(id: string, direction: -1 | 1) {
    const ids = order.items.map((item) => item.id)
    const index = ids.indexOf(id)
    const nextIndex = index + direction
    if (index < 0 || nextIndex < 0 || nextIndex >= ids.length) return
    const moved = ids.splice(index, 1)[0]!
    ids.splice(nextIndex, 0, moved)
    order.reorder(ids)
  }

  return (
    <TooltipProvider>
      <section className="space-y-3 border-t pt-4" aria-label="Attachments">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-sm font-medium">
            Attachments
            {query.data && (
              <span className="ml-2 text-xs tabular-nums text-muted-foreground">
                {query.data.length}
              </span>
            )}
          </h3>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            disabled={!workspaceId || order.isSaving || order.hasDraft}
            onClick={() => setIsAdding(true)}
          >
            <Plus className="size-3.5" aria-hidden="true" />
            Add attachments
          </Button>
        </div>
        {query.isPending ? (
          <Spinner className="size-4" />
        ) : query.isError ? (
          <div
            role="alert"
            className="flex items-center gap-2 text-sm text-destructive"
          >
            Unable to load attachments.
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => void query.refetch()}
            >
              Retry
            </Button>
          </div>
        ) : order.items.length === 0 ? (
          <p className="text-sm text-muted-foreground">No attachments yet.</p>
        ) : (
          <Reorder.Group
            axis="xy"
            values={order.items.map((item) => item.id)}
            onReorder={order.reorder}
            className="flex flex-wrap gap-2"
            aria-label="Project attachments"
          >
            {order.items.map((attachment) => (
              <AttachmentPill
                key={attachment.id}
                attachment={attachment}
                disabled={order.isSaving}
                onOpen={() => {
                  if (!order.hasDraft) setSelectedId(attachment.id)
                }}
                onDragStart={() => order.setIsDragging(true)}
                onDragEnd={() => order.setIsDragging(false)}
                onMove={(direction) => move(attachment.id, direction)}
              />
            ))}
          </Reorder.Group>
        )}
        <p
          role="status"
          aria-live="polite"
          className={order.error ? 'text-xs text-destructive' : 'sr-only'}
        >
          {order.error
            ? 'Unable to save the order. Attachments have been refreshed; please try again.'
            : order.isSaving
              ? 'Saving attachment order…'
              : order.isSaved
                ? 'Attachment order saved.'
                : ''}
        </p>
        {selected && (
          <AttachmentPreview
            attachment={selected}
            targetType={targetType}
            targetId={targetId}
            workspaceId={workspaceId}
            onClose={() => setSelectedId(null)}
          />
        )}
        {isAdding && (
          <AddAttachmentsDialog
            target={{ targetType, targetId }}
            onClose={() => setIsAdding(false)}
          />
        )}
      </section>
    </TooltipProvider>
  )
}
