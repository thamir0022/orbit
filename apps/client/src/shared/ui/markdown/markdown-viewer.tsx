'use client'

import Link from 'next/link'
import { Streamdown, defaultRehypePlugins } from 'streamdown'
import { harden } from 'rehype-harden'

import { cn } from '@/shared/lib/utils'

interface MarkdownViewerProps {
  readonly content: string
  readonly className?: string
}

/** Trusted image URL prefixes configured for Orbit notifications. */
const allowedImagePrefixes =
  process.env.NEXT_PUBLIC_NOTIFICATION_IMAGE_ORIGINS?.split(',')
    .map((origin) => origin.trim())
    .filter((origin) => {
      try {
        const url = new URL(origin)
        return (
          url.protocol === 'https:' &&
          url.username === '' &&
          url.password === ''
        )
      } catch {
        return false
      }
    }) ?? []

/** Limits Markdown links and remote image sources. */
const rehypePlugins = [
  defaultRehypePlugins.sanitize,
  [
    harden,
    {
      allowedProtocols: ['http', 'https', 'mailto'],
      allowedLinkPrefixes: ['*'],
      allowedImagePrefixes,
      allowDataImages: false,
    },
  ],
] satisfies React.ComponentProps<typeof Streamdown>['rehypePlugins']

/** Accepts only safe internal paths or supported external URLs. */
function getSafeHref(href: string | undefined): string | null {
  if (!href) return null

  if (href.startsWith('/') && !href.startsWith('//') && !href.includes('\\')) {
    return href
  }

  try {
    const url = new URL(href)

    return ['https:', 'http:', 'mailto:'].includes(url.protocol) ? href : null
  } catch {
    return null
  }
}

/**
 * Renders static Markdown using Orbit's typography and security rules.
 *
 * - Uses Streamdown without streaming or animation.
 * - Renders internal navigation through Next.js Link.
 * - Restricts external images to configured trusted origins.
 * - Preserves the sanitizer and disables raw HTML processing.
 */
export function MarkdownViewer({ content, className }: MarkdownViewerProps) {
  return (
    <Streamdown
      mode="static"
      linkSafety={{ enabled: false }}
      rehypePlugins={rehypePlugins}
      className={cn('min-w-0 text-sm leading-7 text-foreground', className)}
      components={{
        h1: ({ children }) => (
          <h1 className="mt-5 mb-3 text-xl font-semibold tracking-tight first:mt-0">
            {children}
          </h1>
        ),

        h2: ({ children }) => (
          <h2 className="mt-5 mb-2 text-base font-semibold tracking-tight">
            {children}
          </h2>
        ),

        h3: ({ children }) => (
          <h3 className="mt-4 mb-2 text-sm font-semibold">{children}</h3>
        ),

        p: ({ children }) => (
          <p className="my-3 first:mt-0 last:mb-0">{children}</p>
        ),

        strong: ({ children }) => (
          <strong className="font-semibold text-foreground">{children}</strong>
        ),

        ul: ({ children }) => (
          <ul className="my-3 list-disc space-y-1 pl-5">{children}</ul>
        ),

        ol: ({ children }) => (
          <ol className="my-3 list-decimal space-y-1 pl-5">{children}</ol>
        ),

        blockquote: ({ children }) => (
          <blockquote className="my-4 border-l-2 border-border pl-4 text-muted-foreground">
            {children}
          </blockquote>
        ),

        a: ({ href, children }) => {
          const safeHref = getSafeHref(href)

          if (!safeHref) {
            return <span>{children}</span>
          }

          const classes =
            'font-medium text-foreground underline decoration-border underline-offset-4 transition-colors hover:decoration-foreground focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring'

          if (safeHref.startsWith('/')) {
            return (
              <Link href={safeHref} className={classes}>
                {children}
              </Link>
            )
          }

          return (
            <a
              href={safeHref}
              target="_blank"
              rel="noopener noreferrer"
              className={classes}
            >
              {children}
            </a>
          )
        },
      }}
    >
      {content}
    </Streamdown>
  )
}
