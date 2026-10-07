'use client'

import { Check, Cloud, Loader2, TriangleAlert } from 'lucide-react'
import { type DocumentSaveStatus } from '../model/document-autosave-status'

interface DocumentSaveStatusProps {
  readonly status: DocumentSaveStatus
  readonly onRetry: () => void
}

export function DocumentSaveStatus({
  status,
  onRetry,
}: DocumentSaveStatusProps) {
  switch (status) {
    case 'saved':
      return (
        <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
          <Check className="size-3" />
          Saved
        </span>
      )

    case 'saving':
      return (
        <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
          <Loader2 className="size-3 animate-spin" />
          Saving…
        </span>
      )

    case 'error':
      return (
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center gap-1.5 text-xs text-destructive"
        >
          <TriangleAlert className="size-3" />
          Failed to save · Retry
        </button>
      )

    default:
      return null
  }
}
