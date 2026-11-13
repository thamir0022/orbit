'use client'

import { Reorder, useDragControls, useReducedMotion } from 'motion/react'
import { GripVertical, Paperclip } from 'lucide-react'
import {
  attachmentTitle,
  type FileAttachment,
} from '@/entities/file/api/file-attachment.api'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip'

interface AttachmentPillProps {
  readonly attachment: FileAttachment
  readonly disabled: boolean
  readonly onOpen: () => void
  readonly onDragStart: () => void
  readonly onDragEnd: () => void
  readonly onMove: (direction: -1 | 1) => void
}

export function AttachmentPill({
  attachment,
  disabled,
  onOpen,
  onDragStart,
  onDragEnd,
  onMove,
}: AttachmentPillProps) {
  const controls = useDragControls()
  const reducedMotion = useReducedMotion()
  const title = attachmentTitle(attachment)
  return (
    <Reorder.Item
      value={attachment.id}
      dragListener={false}
      dragControls={controls}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      whileDrag={reducedMotion ? undefined : { scale: 1.04, zIndex: 10 }}
      transition={
        reducedMotion
          ? { duration: 0 }
          : { type: 'spring', stiffness: 460, damping: 34 }
      }
      className="relative flex h-9 max-w-full items-center rounded-full border bg-background shadow-xs transition-colors hover:bg-muted/60 sm:max-w-72"
    >
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            aria-disabled={disabled}
            aria-label={`Reorder ${title}. Use left and right arrow keys to move.`}
            className="flex h-full w-8 shrink-0 cursor-grab touch-none items-center justify-center rounded-l-full text-muted-foreground outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring active:cursor-grabbing aria-disabled:cursor-default aria-disabled:opacity-40"
            onPointerDown={(event) => {
              if (!disabled) controls.start(event)
            }}
            onKeyDown={(event) => {
              if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
                event.preventDefault()
                event.stopPropagation()
                if (!disabled) onMove(event.key === 'ArrowLeft' ? -1 : 1)
              }
            }}
          >
            <GripVertical className="size-3.5" aria-hidden="true" />
          </button>
        </TooltipTrigger>
        <TooltipContent>Drag to reorder · ← → to move</TooltipContent>
      </Tooltip>
      <button
        type="button"
        onClick={onOpen}
        disabled={disabled}
        className="flex h-full min-w-0 items-center gap-1.5 rounded-r-full pr-3 text-xs font-medium outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label={`Preview ${title}`}
        title={title}
      >
        <Paperclip
          className="size-3.5 shrink-0 text-muted-foreground"
          aria-hidden="true"
        />
        <span className="truncate">{title}</span>
      </button>
    </Reorder.Item>
  )
}
