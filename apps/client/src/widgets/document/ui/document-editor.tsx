'use client'

import { useDocumentAutosave } from '@/features/document/edit-document'

import type { DocumentContent } from '@/entities/document'

import { SimpleEditor } from '@/shared/ui/tiptap-templates/simple/simple-editor'
import { DocumentSaveStatus } from '@/features/document/edit-document/ui/document-save-status'

interface DocumentEditorProps {
  readonly documentId?: string
  readonly content: DocumentContent
  readonly editable?: boolean
  readonly onCreated?: (documentId: string) => void
}

/**
 * Renders the document editor with blur-based persistence.
 */
export function DocumentEditor({
  documentId,
  content,
  editable = true,
  onCreated,
}: DocumentEditorProps) {
  const { status, scheduleSave, saveNow, retry } = useDocumentAutosave({
    documentId,
    content,
    onCreated,
  })

  return (
    <section className="flex min-h-0 flex-1 flex-col">
      <div className="flex h-9 shrink-0 items-center justify-end px-4">
        <DocumentSaveStatus status={status} onRetry={retry} />
      </div>

      <SimpleEditor
        content={content}
        editable={editable}
        onContentChange={scheduleSave}
        onBlur={saveNow}
      />
    </section>
  )
}
