'use client'

import { FileText } from 'lucide-react'

import { useDocumentQuery } from '@/entities/document'

import { DocumentEditor } from '@/widgets/document'

export function DocumentPage({ documentId }: { documentId: string }) {
  const { data: document, isPending, isError } = useDocumentQuery(documentId)

  if (isPending) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <span className="text-sm text-muted-foreground">Loading document…</span>
      </div>
    )
  }

  if (isError || !document) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-2">
        <FileText className="size-5 text-muted-foreground" />

        <p className="text-sm text-muted-foreground">
          Unable to load this document.
        </p>
      </div>
    )
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <DocumentEditor documentId={document.id} content={document.content} />
    </div>
  )
}
