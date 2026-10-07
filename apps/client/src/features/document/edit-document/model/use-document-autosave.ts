'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

import type { DocumentContent } from '@/entities/document'

import { useCreateDocumentMutation } from '@/features/document/create-document'
import { useUpdateDocumentMutation } from './use-update-document.mutation'
import { DocumentSaveStatus } from './document-autosave-status'
import { getDocumentTitleFromContent } from '@/entities/document/lib/document-title'

interface UseDocumentAutosaveOptions {
  readonly documentId?: string
  readonly content: DocumentContent
  readonly onCreated?: (documentId: string) => void
}

interface UseDocumentAutosaveResult {
  readonly status: DocumentSaveStatus
  readonly scheduleSave: (content: DocumentContent) => void
  readonly saveNow: () => Promise<void>
  readonly retry: () => Promise<void>
}

/**
 * Provides document persistence for new and existing documents.
 *
 * Content changes only mark the document as dirty.
 * Persistence happens explicitly on blur or retry.
 */
export function useDocumentAutosave({
  documentId,
  content,
  onCreated,
}: UseDocumentAutosaveOptions): UseDocumentAutosaveResult {
  const { mutateAsync: createDocument } = useCreateDocumentMutation()
  const { mutateAsync: updateDocument } = useUpdateDocumentMutation()

  const [status, setStatus] = useState<DocumentSaveStatus>('idle')

  const activeDocumentIdRef = useRef<string | undefined>(documentId)

  const latestContentRef = useRef<DocumentContent>(content)

  const initialContentRef = useRef(JSON.stringify(content))

  const changeVersionRef = useRef(0)
  const savedVersionRef = useRef(0)

  const isDirtyRef = useRef(false)
  const isSavingRef = useRef(false)

  const locallyCreatedRef = useRef(false)
  const creationNotifiedRef = useRef(false)

  const onCreatedRef = useRef(onCreated)

  /**
   * Keeps the latest callback without recreating the persistence function.
   */
  useEffect(() => {
    onCreatedRef.current = onCreated
  }, [onCreated])

  /**
   * Synchronizes the active document when the route changes.
   */
  useEffect(() => {
    activeDocumentIdRef.current = documentId

    if (documentId) {
      locallyCreatedRef.current = false
      creationNotifiedRef.current = false
    }
  }, [documentId])

  /**
   * Persists the latest unsaved document state.
   *
   * Existing documents are updated only when saveNow is called,
   * which is normally triggered by editor blur.
   */
  const persist = useCallback(async (): Promise<void> => {
    if (!isDirtyRef.current || isSavingRef.current) {
      return
    }

    isSavingRef.current = true

    const targetVersion = changeVersionRef.current
    const targetContent = latestContentRef.current

    setStatus('saving')

    try {
      let activeDocumentId = activeDocumentIdRef.current

      if (!activeDocumentId) {
        const response = await createDocument({
          title: getDocumentTitleFromContent(targetContent),
          content: targetContent,
        })

        activeDocumentId = response.data.document.id

        activeDocumentIdRef.current = activeDocumentId
        locallyCreatedRef.current = true
      } else {
        await updateDocument({
          documentId: activeDocumentId,
          payload: {
            title: getDocumentTitleFromContent(targetContent),
            content: targetContent,
          },
        })
      }

      /*
       * Only the snapshot captured at the beginning of this request
       * is guaranteed to be persisted.
       */
      savedVersionRef.current = targetVersion

      const hasUnsavedChanges =
        changeVersionRef.current !== savedVersionRef.current

      isDirtyRef.current = hasUnsavedChanges

      if (hasUnsavedChanges) {
        /*
         * The user changed the document while the request was running.
         * Do not automatically send another update.
         * The next blur will persist the newer version.
         */
        setStatus('idle')

        return
      }

      setStatus('saved')

      /*
       * Redirect only after a newly created document has been fully
       * persisted with the latest editor state.
       */
      if (
        locallyCreatedRef.current &&
        activeDocumentId &&
        !creationNotifiedRef.current
      ) {
        creationNotifiedRef.current = true

        onCreatedRef.current?.(activeDocumentId)
      }
    } catch {
      setStatus('error')
    } finally {
      isSavingRef.current = false
    }
  }, [createDocument, updateDocument])

  /**
   * Records the latest editor content without persisting it.
   *
   * The actual save happens when the editor loses focus.
   */
  const scheduleSave = useCallback((nextContent: DocumentContent) => {
    latestContentRef.current = nextContent

    /*
     * Do not create an empty document just because the user
     * opened /docs/new and focused/blurred the editor.
     */
    if (
      !activeDocumentIdRef.current &&
      JSON.stringify(nextContent) === initialContentRef.current
    ) {
      isDirtyRef.current = false
      setStatus('idle')

      return
    }

    changeVersionRef.current += 1
    isDirtyRef.current = true

    setStatus('idle')
  }, [])

  /**
   * Immediately persists the latest unsaved state.
   *
   * Used by the editor blur handler.
   */
  const saveNow = useCallback(async (): Promise<void> => {
    await persist()
  }, [persist])

  /**
   * Retries the latest failed save.
   */
  const retry = useCallback(async (): Promise<void> => {
    if (!isDirtyRef.current) {
      return
    }

    await persist()
  }, [persist])

  return {
    status,
    scheduleSave,
    saveNow,
    retry,
  }
}
