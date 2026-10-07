'use client'

import { PanelLeftOpen } from 'lucide-react'
import { useState, type ReactNode } from 'react'

import { Button } from '@/shared/ui/button'

import { DocsSidebar } from './docs-sidebar'

interface DocsLayoutProps {
  readonly children: ReactNode
}

/**
 * Provides the persistent document workspace layout.
 *
 * The layout owns the sidebar state while the sidebar itself remains
 * mounted during route changes.
 */
export function DocsLayout({ children }: DocsLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  return (
    <section className="flex min-h-0 min-w-0 flex-1 overflow-hidden">
      <DocsSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <main className="relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        {!isSidebarOpen && (
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            aria-label="Open documents sidebar"
            aria-controls="docs-sidebar"
            aria-expanded={false}
            onClick={() => setIsSidebarOpen(true)}
            className="absolute left-3 top-3 z-20 shadow-sm"
          >
            <PanelLeftOpen className="size-4" />
          </Button>
        )}

        <div className="min-h-0 min-w-0 flex-1 overflow-hidden">{children}</div>
      </main>
    </section>
  )
}
