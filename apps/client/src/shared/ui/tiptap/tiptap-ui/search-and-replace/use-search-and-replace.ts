import { useCallback, useEffect, useState } from 'react'
import type { Editor } from '@tiptap/react'
import { useCurrentEditor } from '@tiptap/react'
import type { FindAndReplaceStorage } from '@tiptap/extension-find-and-replace'

import { useTiptapEditor } from '@/shared/hooks/use-tiptap-editor'
import { SearchIcon } from '../../tiptap-icons/search-icon'
import { isExtensionAvailable } from '@/shared/lib/tiptap/tiptap-utils'

export const SEARCH_AND_REPLACE_SHORTCUT_KEY = 'mod+f'
export const NEXT_RESULT_SHORTCUT_KEY = 'mod+shift+f'
export const PREVIOUS_RESULT_SHORTCUT_KEY = 'mod+shift+d'

/**
 * CSS classes rendered by the Find and Replace extension for result
 * decorations inside the editor.
 */
export const SEARCH_RESULT_CLASS = 'find-and-replace-result'
export const SEARCH_RESULT_CURRENT_CLASS = 'find-and-replace-result-current'

export const DEFAULT_SCROLL_INTO_VIEW_OPTIONS: ScrollIntoViewOptions = {
  block: 'nearest',
  inline: 'nearest',
}

/**
 * Configuration for the search and replace functionality.
 */
export interface UseSearchAndReplaceConfig {
  /**
   * The Tiptap editor instance.
   */
  editor?: Editor | null

  /**
   * Whether the trigger should hide when the Find and Replace extension
   * is not registered on the editor.
   * @default false
   */
  hideWhenUnavailable?: boolean

  /**
   * How the current result is scrolled into view. `behavior` is forced to
   * `auto` when the user prefers reduced motion.
   * @default DEFAULT_SCROLL_INTO_VIEW_OPTIONS
   */
  scrollIntoViewOptions?: ScrollIntoViewOptions
}

/**
 * Reactive snapshot of the Find and Replace extension storage.
 */
export interface SearchAndReplaceEditorState {
  /**
   * Number of results for the applied search term.
   */
  total: number

  /**
   * Zero-based index of the current result, or `null` when none is selected.
   */
  currentIndex: number | null

  /**
   * The search term the extension has applied (post-debounce).
   */
  appliedSearchTerm: string

  /**
   * Whether the search is case sensitive.
   */
  caseSensitive: boolean

  /**
   * Whether only whole words are matched.
   */
  wholeWord: boolean

  /**
   * Whether the search term is treated as a regular expression.
   */
  useRegex: boolean
}

const EMPTY_EDITOR_STATE: SearchAndReplaceEditorState = {
  total: 0,
  currentIndex: null,
  appliedSearchTerm: '',
  caseSensitive: false,
  wholeWord: false,
  useRegex: false,
}

/**
 * Checks if the Find and Replace extension is registered on the editor.
 */
export function isFindAndReplaceAvailable(editor: Editor | null): boolean {
  return isExtensionAvailable(editor, 'findAndReplace')
}

/**
 * Returns the Find and Replace extension storage, or `null` when unavailable.
 */
export function getFindAndReplaceStorage(
  editor: Editor | null
): FindAndReplaceStorage | null {
  if (!isFindAndReplaceAvailable(editor)) return null
  return editor?.storage.findAndReplace ?? null
}

/**
 * Determines if the search and replace trigger should be shown.
 */
export function shouldShowSearchAndReplace(props: {
  editor: Editor | null
  hideWhenUnavailable: boolean
}): boolean {
  const { editor, hideWhenUnavailable } = props

  if (!editor) return false
  if (hideWhenUnavailable) return isFindAndReplaceAvailable(editor)

  return true
}

/**
 * Formats the result counter as `current / total` for display.
 */
export function formatResultCount(
  currentIndex: number | null,
  total: number
): string {
  if (total === 0) return '0 / 0'
  if (currentIndex === null) return `0 / ${total}`

  return `${currentIndex + 1} / ${total}`
}

interface NavigateSearchResultOptions {
  editor: Editor
  direction: 'next' | 'previous'
}

function navigateSearchResult({
  editor,
  direction,
}: NavigateSearchResultOptions): boolean {
  const selection = editor.state.selection
  const chain = editor.chain()
  const navigation =
    direction === 'next' ? chain.goToNextResult() : chain.goToPreviousResult()

  // Search navigation should update its highlight without changing the
  // editor selection that drives toolbar state.
  return navigation
    .command(({ tr }) => {
      tr.setSelection(selection.map(tr.doc, tr.mapping))
      return true
    })
    .run()
}

/**
 * Scrolls the current result into view without stealing focus.
 */
export function scrollCurrentResultIntoView(
  editor: Editor | null,
  scrollIntoViewOptions: ScrollIntoViewOptions = DEFAULT_SCROLL_INTO_VIEW_OPTIONS
): void {
  if (!editor || editor.isDestroyed) return

  const storage = getFindAndReplaceStorage(editor)
  const currentIndex = storage?.currentIndex
  if (!storage || currentIndex === null || currentIndex === undefined) return

  const result = storage.results[currentIndex]
  if (!result) return

  const editorDom = editor.view.dom
  if (editorDom.contains(document.activeElement)) return

  let target: HTMLElement | null = null

  try {
    const { node } = editor.view.domAtPos(result.from)
    target = node instanceof HTMLElement ? node : node.parentElement
  } catch {
    return
  }

  if (!target || typeof target.scrollIntoView !== 'function') return

  const prefersReducedMotion =
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches

  target.scrollIntoView({
    behavior: 'smooth',
    ...scrollIntoViewOptions,
    ...(prefersReducedMotion ? { behavior: 'auto' } : {}),
  })
}

/**
 * Main hook that provides search and replace functionality for a Tiptap editor.
 */
export function useSearchAndReplace(config?: UseSearchAndReplaceConfig) {
  const {
    editor: providedEditor,
    hideWhenUnavailable = false,
    scrollIntoViewOptions = DEFAULT_SCROLL_INTO_VIEW_OPTIONS,
  } = config || {}

  const { editor: resolvedEditor } = useTiptapEditor(providedEditor)
  const { editor: contextEditor } = useCurrentEditor()
  const editor = resolvedEditor ?? providedEditor ?? contextEditor ?? null
  const canSearch = isFindAndReplaceAvailable(editor)

  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    if (!editor) return

    const handleUpdate = () => {
      setIsVisible(shouldShowSearchAndReplace({ editor, hideWhenUnavailable }))
    }

    handleUpdate()

    editor.on('transaction', handleUpdate)

    return () => {
      editor.off('transaction', handleUpdate)
    }
  }, [editor, hideWhenUnavailable])

  const [searchTerm, setSearchTermState] = useState('')
  const [replaceTerm, setReplaceTermState] = useState('')

  // Adopt the extension's initial terms asynchronously.
  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const storage = getFindAndReplaceStorage(editor)
      if (!storage) return

      if (storage.searchTerm) {
        setSearchTermState((previous) => previous || storage.searchTerm)
      }

      if (storage.replaceTerm) {
        setReplaceTermState((previous) => previous || storage.replaceTerm)
      }
    })

    return () => {
      window.cancelAnimationFrame(frame)
    }
  }, [editor])

  const [editorState, setEditorState] =
    useState<SearchAndReplaceEditorState>(EMPTY_EDITOR_STATE)

  useEffect(() => {
    if (!editor || !isFindAndReplaceAvailable(editor)) {
      const frame = window.requestAnimationFrame(() => {
        setEditorState(EMPTY_EDITOR_STATE)
      })

      return () => {
        window.cancelAnimationFrame(frame)
      }
    }

    const sync = () => {
      const storage = getFindAndReplaceStorage(editor)
      if (!storage) return

      const next: SearchAndReplaceEditorState = {
        total: storage.results.length,
        currentIndex: storage.currentIndex,
        appliedSearchTerm: storage.searchTerm,
        caseSensitive: storage.caseSensitive,
        wholeWord: storage.wholeWord,
        useRegex: storage.useRegex,
      }

      setEditorState((previous) =>
        previous.total === next.total &&
        previous.currentIndex === next.currentIndex &&
        previous.appliedSearchTerm === next.appliedSearchTerm &&
        previous.caseSensitive === next.caseSensitive &&
        previous.wholeWord === next.wholeWord &&
        previous.useRegex === next.useRegex
          ? previous
          : next
      )
    }

    const frame = window.requestAnimationFrame(sync)

    editor.on('transaction', sync)

    return () => {
      window.cancelAnimationFrame(frame)
      editor.off('transaction', sync)
    }
  }, [editor])

  const {
    total,
    currentIndex,
    appliedSearchTerm,
    caseSensitive,
    wholeWord,
    useRegex,
  } = editorState

  const setSearchTerm = useCallback(
    (value: string) => {
      setSearchTermState(value)

      if (!editor || !isFindAndReplaceAvailable(editor)) return

      if (value.length === 0) {
        editor.commands.clearSearch()
      } else {
        editor.commands.setSearchTerm(value)
      }
    },
    [editor]
  )

  const setReplaceTerm = useCallback(
    (value: string) => {
      setReplaceTermState(value)

      if (!editor || !isFindAndReplaceAvailable(editor)) return
      editor.commands.setReplaceTerm(value)
    },
    [editor]
  )

  const toggleCaseSensitive = useCallback(() => {
    if (!editor || !isFindAndReplaceAvailable(editor)) return

    editor.commands.setCaseSensitive(
      !getFindAndReplaceStorage(editor)?.caseSensitive
    )
  }, [editor])

  const toggleWholeWord = useCallback(() => {
    if (!editor || !isFindAndReplaceAvailable(editor)) return

    editor.commands.setWholeWord(!getFindAndReplaceStorage(editor)?.wholeWord)
  }, [editor])

  const toggleUseRegex = useCallback(() => {
    if (!editor || !isFindAndReplaceAvailable(editor)) return

    editor.commands.setUseRegex(!getFindAndReplaceStorage(editor)?.useRegex)
  }, [editor])

  const goToNext = useCallback(() => {
    if (!editor) return false
    return navigateSearchResult({ editor, direction: 'next' })
  }, [editor])

  const goToPrevious = useCallback(() => {
    if (!editor) return false
    return navigateSearchResult({ editor, direction: 'previous' })
  }, [editor])

  const replaceCurrent = useCallback(() => {
    if (!editor || !editor.isEditable) return false
    return editor.commands.replace()
  }, [editor])

  const replaceAll = useCallback(() => {
    if (!editor || !editor.isEditable) return false
    return editor.commands.replaceAll()
  }, [editor])

  /**
   * Re-applies the stored terms to the editor.
   */
  const applySearch = useCallback(() => {
    if (!editor || !isFindAndReplaceAvailable(editor)) return

    editor.commands.setReplaceTerm(replaceTerm)

    if (searchTerm) {
      editor.commands.setSearchTerm(searchTerm)
    }
  }, [editor, searchTerm, replaceTerm])

  /**
   * Clears highlights and cancels pending work while keeping entered terms.
   */
  const suspendSearch = useCallback(() => {
    if (!editor || !isFindAndReplaceAvailable(editor) || editor.isDestroyed) {
      return
    }

    editor.commands.clearSearch()
  }, [editor])

  /**
   * Clears the search entirely: highlights, pending work and field values.
   */
  const clearSearch = useCallback(() => {
    setSearchTermState('')
    setReplaceTermState('')

    if (!editor || !isFindAndReplaceAvailable(editor) || editor.isDestroyed) {
      return
    }

    editor.commands.clearSearch()
  }, [editor])

  useEffect(() => {
    if (!editor || !canSearch) return

    return () => {
      if (editor.isDestroyed) return
      editor.commands.clearSearch()
    }
  }, [editor, canSearch])

  useEffect(() => {
    if (total === 0 || currentIndex === null) return

    const frame = requestAnimationFrame(() => {
      scrollCurrentResultIntoView(editor, scrollIntoViewOptions)
    })

    return () => cancelAnimationFrame(frame)
  }, [editor, total, currentIndex, appliedSearchTerm, scrollIntoViewOptions])

  const isEditable = !!editor?.isEditable
  const canNavigate = canSearch && total > 0
  const hasReplaceTerm = replaceTerm.length > 0

  const canReplace =
    canSearch &&
    isEditable &&
    hasReplaceTerm &&
    total > 0 &&
    currentIndex !== null

  const canReplaceAll = canSearch && isEditable && hasReplaceTerm && total > 0

  return {
    editor,
    isVisible,
    canSearch,
    searchTerm,
    replaceTerm,
    appliedSearchTerm,
    total,
    currentIndex,
    resultCountLabel: formatResultCount(currentIndex, total),
    caseSensitive,
    wholeWord,
    useRegex,
    canNavigate,
    canReplace,
    canReplaceAll,
    setSearchTerm,
    setReplaceTerm,
    toggleCaseSensitive,
    toggleWholeWord,
    toggleUseRegex,
    goToNext,
    goToPrevious,
    replaceCurrent,
    replaceAll,
    applySearch,
    suspendSearch,
    clearSearch,
    label: 'Search and replace',
    shortcutKeys: SEARCH_AND_REPLACE_SHORTCUT_KEY,
    Icon: SearchIcon,
  }
}

export type UseSearchAndReplaceReturn = ReturnType<typeof useSearchAndReplace>
