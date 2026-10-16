import throttle from 'lodash.throttle'
import { useLayoutEffect, useMemo, useRef } from 'react'

import { useUnmount } from '@/shared/hooks/use-unmount'

interface ThrottleSettings {
  leading?: boolean | undefined
  trailing?: boolean | undefined
}

const defaultOptions: ThrottleSettings = {
  leading: false,
  trailing: true,
}

/**
 * A hook that returns a throttled callback function.
 *
 * @param fn The function to throttle
 * @param wait The time in ms to wait before calling the function
 * @param dependencies The dependencies to watch for changes
 * @param options The throttle options
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useThrottledCallback<T extends (...args: any[]) => any>(
  fn: T,
  wait = 250,
  _dependencies: React.DependencyList = [],
  options: ThrottleSettings = defaultOptions
): {
  (this: ThisParameterType<T>, ...args: Parameters<T>): ReturnType<T>
  cancel: () => void
  flush: () => void
} {
  const fnRef = useRef(fn)

  useLayoutEffect(() => {
    fnRef.current = fn
  }, [fn])

  const handler = useMemo(
    () =>
      throttle<T>(
        function (this: ThisParameterType<T>, ...args: Parameters<T>) {
          return fnRef.current.apply(this, args)
        } as T,
        wait,
        options
      ),
    [wait, options]
  )

  useUnmount(() => {
    handler.cancel()
  })

  return handler
}

export default useThrottledCallback
