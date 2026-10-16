import type { Editor } from '@tiptap/react'
import { useCurrentEditor, useEditorState } from '@tiptap/react'
import { useCallback, useSyncExternalStore } from 'react'

function getActivePageEditor(editor: Editor): Editor | null {
  const storage = editor.storage as unknown as Record<string, unknown>
  const pages = storage.pages as { activeEditor?: Editor | null } | undefined

  if (!pages || !('activeEditor' in pages)) {
    return null
  }

  return pages.activeEditor ?? null
}

function useActivePageEditor(mainEditor: Editor | null): Editor | null {
  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      if (!mainEditor) {
        return () => {}
      }

      let subscribedPageEditor = getActivePageEditor(mainEditor)

      const handlePageEditorDestroy = () => {
        onStoreChange()
      }

      const handleMainEditorChange = () => {
        const nextPageEditor = getActivePageEditor(mainEditor)

        if (nextPageEditor !== subscribedPageEditor) {
          subscribedPageEditor?.off('destroy', handlePageEditorDestroy)

          subscribedPageEditor = nextPageEditor

          subscribedPageEditor?.on('destroy', handlePageEditorDestroy)
        }

        onStoreChange()
      }

      mainEditor.on('update', handleMainEditorChange)
      mainEditor.on('selectionUpdate', handleMainEditorChange)
      subscribedPageEditor?.on('destroy', handlePageEditorDestroy)

      return () => {
        mainEditor.off('update', handleMainEditorChange)
        mainEditor.off('selectionUpdate', handleMainEditorChange)
        subscribedPageEditor?.off('destroy', handlePageEditorDestroy)
      }
    },
    [mainEditor]
  )

  const getSnapshot = useCallback(() => {
    const activeEditor = mainEditor ? getActivePageEditor(mainEditor) : null

    return activeEditor && !activeEditor.isDestroyed ? activeEditor : null
  }, [mainEditor])

  return useSyncExternalStore(subscribe, getSnapshot, () => null)
}

export function useTiptapEditor(providedEditor?: Editor | null): {
  editor: Editor | null
  editorState?: Editor['state']
  canCommand?: Editor['can']
} {
  const { editor: coreEditor } = useCurrentEditor()
  const mainEditor = providedEditor ?? coreEditor

  const storageEditor = useActivePageEditor(mainEditor)

  const editorState = useEditorState({
    editor: storageEditor ?? mainEditor,
    selector(context) {
      if (!context.editor) {
        return {
          editor: null,
          editorState: undefined,
          canCommand: undefined,
        }
      }

      return {
        editor: context.editor,
        editorState: context.editor.state,
        canCommand: context.editor.can,
      }
    },
  })

  return editorState ?? { editor: null }
}
