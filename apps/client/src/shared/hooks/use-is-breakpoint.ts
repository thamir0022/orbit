'use client'

import { useCallback, useSyncExternalStore } from 'react'

type BreakpointMode = 'min' | 'max'

/**
 * Detects whether the viewport matches a breakpoint.
 *
 * @example
 * useIsBreakpoint('max', 768)  // true when width < 768px
 * useIsBreakpoint('min', 1024) // true when width >= 1024px
 */
export function useIsBreakpoint(
  mode: BreakpointMode = 'max',
  breakpoint = 768
): boolean {
  const query =
    mode === 'min'
      ? `(min-width: ${breakpoint}px)`
      : `(max-width: ${breakpoint - 1}px)`

  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      const mediaQuery = window.matchMedia(query)

      mediaQuery.addEventListener('change', onStoreChange)

      return () => {
        mediaQuery.removeEventListener('change', onStoreChange)
      }
    },
    [query]
  )

  const getSnapshot = useCallback(
    () => window.matchMedia(query).matches,
    [query]
  )

  // Keep server rendering and initial hydration consistent.
  const getServerSnapshot = useCallback(() => false, [])

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}
