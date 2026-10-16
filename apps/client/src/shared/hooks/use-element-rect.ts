'use client'

import { useCallback, useEffect, useState } from 'react'
import type { RefObject } from 'react'

import { useThrottledCallback } from '@/shared/hooks/use-throttled-callback'

export type RectState = Omit<DOMRect, 'toJSON'>

export interface ElementRectOptions {
  /**
   * Element, ref, or CSS selector to track.
   * Defaults to document.body.
   */
  element?: Element | RefObject<Element> | string | null

  /** Whether rectangle tracking is enabled. */
  enabled?: boolean

  /** Throttle delay in milliseconds. */
  throttleMs?: number

  /** Whether to observe element size changes. */
  useResizeObserver?: boolean
}

const initialRect: RectState = {
  x: 0,
  y: 0,
  width: 0,
  height: 0,
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,
}

const isClientSide = () => typeof window !== 'undefined'

/**
 * Tracks an element's bounding rectangle across scroll and resize events.
 */
export function useElementRect({
  element,
  enabled = true,
  throttleMs = 100,
  useResizeObserver = true,
}: ElementRectOptions = {}): RectState {
  const [rect, setRect] = useState<RectState>(initialRect)

  const getTargetElement = useCallback((): Element | null => {
    if (!enabled || !isClientSide()) {
      return null
    }

    if (!element) {
      return document.body
    }

    if (typeof element === 'string') {
      return document.querySelector(element)
    }

    if ('current' in element) {
      return element.current
    }

    return element
  }, [element, enabled])

  const updateRect = useThrottledCallback(
    () => {
      if (!enabled || !isClientSide()) {
        return
      }

      const targetElement = getTargetElement()

      if (!targetElement) {
        setRect(initialRect)
        return
      }

      const { x, y, width, height, top, right, bottom, left } =
        targetElement.getBoundingClientRect()

      setRect({
        x,
        y,
        width,
        height,
        top,
        right,
        bottom,
        left,
      })
    },
    throttleMs,
    [enabled, getTargetElement],
    { leading: true, trailing: true }
  )

  useEffect(() => {
    if (!enabled || !isClientSide()) {
      return
    }

    const targetElement = getTargetElement()

    // Measure asynchronously instead of updating state in the effect.
    const frameId = window.requestAnimationFrame(updateRect)

    let resizeObserver: ResizeObserver | undefined

    if (
      targetElement &&
      useResizeObserver &&
      typeof ResizeObserver !== 'undefined'
    ) {
      resizeObserver = new ResizeObserver(() => {
        window.requestAnimationFrame(updateRect)
      })

      resizeObserver.observe(targetElement)
    }

    window.addEventListener('scroll', updateRect, true)
    window.addEventListener('resize', updateRect)

    return () => {
      window.cancelAnimationFrame(frameId)
      resizeObserver?.disconnect()

      window.removeEventListener('scroll', updateRect, true)
      window.removeEventListener('resize', updateRect)
    }
  }, [enabled, getTargetElement, updateRect, useResizeObserver])

  // Avoid a synchronous state reset when tracking is disabled.
  return enabled ? rect : initialRect
}

/**
 * Tracks document.body.
 */
export function useBodyRect(
  options: Omit<ElementRectOptions, 'element'> = {}
): RectState {
  return useElementRect({
    ...options,
    element: isClientSide() ? document.body : null,
  })
}

/**
 * Tracks an element referenced by a ref.
 */
export function useRefRect<T extends Element>(
  ref: RefObject<T>,
  options: Omit<ElementRectOptions, 'element'> = {}
): RectState {
  return useElementRect({
    ...options,
    element: ref,
  })
}
