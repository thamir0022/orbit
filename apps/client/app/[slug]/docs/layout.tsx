import type { ReactNode } from 'react'

import { DocsLayout } from '@/widgets/document/ui/docs-layout'

interface DocsRouteLayoutProps {
  readonly children: ReactNode
}

/**
 * Provides the persistent document route shell.
 */
export default function DocsRouteLayout({ children }: DocsRouteLayoutProps) {
  return <DocsLayout>{children}</DocsLayout>
}
