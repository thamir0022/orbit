'use client'

import { PanelLeftClose, PanelLeftOpen } from 'lucide-react'

import { Button } from '@/shared/ui/button'
import { useSidebar } from '@/shared/ui/sidebar'

interface DocsContentProps {
  readonly children: React.ReactNode
}

/**
 * Renders the main document workspace content area.
 *
 * The component owns only the Docs shell and navigation controls;
 * document-specific content such as the Tiptap editor is rendered
 * by the active route inside the children slot.
 */
export function DocsContent({ children }: DocsContentProps) {
  const { open, toggleSidebar } = useSidebar()

  return (
    <div className="flex h-full min-h-0 flex-col">
      <header className="sticky top-0 z-20 flex h-12 shrink-0 items-center border-b bg-background/95 px-3 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-8 shrink-0 rounded-md"
          onClick={toggleSidebar}
          aria-label={
            open ? 'Collapse documents sidebar' : 'Open documents sidebar'
          }
          title={open ? 'Collapse sidebar' : 'Open sidebar'}
        >
          {open ? (
            <PanelLeftClose className="size-4" />
          ) : (
            <PanelLeftOpen className="size-4" />
          )}
        </Button>

        <div className="mx-2 h-4 w-px bg-border" />

        <div className="min-w-0 flex-1">
          <span className="text-sm font-medium tracking-tight">Docs</span>
        </div>
      </header>

      <main className="min-h-0 flex-1 overflow-y-auto">{children}</main>
    </div>
  )
}
