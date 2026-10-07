'use client'

import Link from 'next/link'
import { useParams, usePathname } from 'next/navigation'
import { PanelLeftClose, Plus, RefreshCw } from 'lucide-react'

import { useDocumentsQuery, type DocumentSummary } from '@/entities/document'

import { cn } from '@/shared/lib/utils'
import { Button } from '@/shared/ui/button'
import { ScrollArea } from '@/shared/ui/scroll-area'
import { Separator } from '@/shared/ui/separator'
import { Skeleton } from '@/shared/ui/skeleton'

interface DocsSidebarProps {
  readonly isOpen: boolean
  readonly onClose: () => void
}

/**
 * Renders the persistent document navigation sidebar.
 *
 * The sidebar uses the lightweight document summary query and animates
 * both its container width and inner content independently.
 */
export function DocsSidebar({ isOpen, onClose }: DocsSidebarProps) {
  const pathname = usePathname()

  const params = useParams<{
    slug: string
  }>()

  const workspaceSlug = params['slug']

  const docsBasePath = `/${workspaceSlug}/docs`
  const newDocumentPath = `${docsBasePath}/new`

  const {
    data: documents = [],
    isPending,
    isError,
    isFetching,
    refetch,
  } = useDocumentsQuery()

  return (
    <aside
      id="docs-sidebar"
      aria-label="Documents navigation"
      aria-hidden={!isOpen}
      className={cn(
        'relative min-h-0 shrink-0 overflow-hidden',
        'border-r bg-background',
        'transition-[width,border-color]',
        'duration-300 ease-out',
        'motion-reduce:transition-none',
        isOpen ? 'w-72' : 'w-0 border-transparent'
      )}
    >
      <div
        inert={!isOpen}
        className={cn(
          'flex h-full w-72 min-w-72 flex-col',
          'overflow-hidden',
          'transition-[opacity,transform]',
          'duration-300 ease-out',
          'motion-reduce:transition-none',
          isOpen
            ? 'translate-x-0 opacity-100'
            : 'pointer-events-none -translate-x-3 opacity-0'
        )}
      >
        <header className="w-full shrink-0">
          <div className="flex items-center justify-between gap-3 px-3 py-3">
            <p className="truncate text-lg font-semibold tracking-tight">
              Docs
            </p>

            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              aria-label="Close documents sidebar"
              aria-controls="docs-sidebar"
              aria-expanded={isOpen}
              onClick={onClose}
              className="shrink-0"
            >
              <PanelLeftClose className="size-4" />
            </Button>
          </div>
          <Separator />
        </header>

        <ScrollArea className="min-h-0 flex-1">
          <div className="w-full px-2 py-4">
            <Link href={newDocumentPath}>
              <Button variant="ghost" size="lg" className="px-6 w-full">
                <Plus className="size-4" />
                New Doc
              </Button>
            </Link>
          </div>

          <div className="px-2 py-3">
            <div className="px-2 pb-2">
              <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                My documents
              </p>
            </div>

            {isPending ? (
              <DocumentSidebarSkeleton />
            ) : isError ? (
              <DocumentSidebarError
                isFetching={isFetching}
                onRetry={() => void refetch()}
              />
            ) : documents.length === 0 ? (
              <DocumentSidebarEmpty href={newDocumentPath} />
            ) : (
              <DocumentSidebarList
                documents={documents}
                pathname={pathname}
                basePath={docsBasePath}
              />
            )}
          </div>
        </ScrollArea>
      </div>
    </aside>
  )
}

interface DocumentSidebarListProps {
  readonly documents: DocumentSummary[]
  readonly pathname: string
  readonly basePath: string
}

/**
 * Renders document navigation items.
 *
 * The active state is derived directly from the current URL so routing
 * remains the source of truth.
 */
function DocumentSidebarList({
  documents,
  pathname,
  basePath,
}: DocumentSidebarListProps) {
  return (
    <nav aria-label="Documents">
      <ul className="space-y-0.5">
        {documents.map((document) => {
          const href = `${basePath}/${document.id}`
          const isActive = pathname === href

          return (
            <li key={document.id}>
              <Link
                href={href}
                aria-current={isActive ? 'page' : undefined}
                title={document.title || 'Untitled'}
                className={cn(
                  'flex h-9 min-w-0 items-center gap-2 rounded-md px-2.5',
                  'text-sm transition-colors',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  isActive
                    ? 'bg-muted font-medium text-foreground'
                    : [
                        'text-muted-foreground',
                        'hover:bg-muted/70 hover:text-foreground',
                      ]
                )}
              >

                <span className="truncate w-52">
                  {document.title || 'Untitled'}
                </span>
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

/**
 * Renders the document navigation loading state.
 */
function DocumentSidebarSkeleton() {
  return (
    <div className="space-y-1">
      {Array.from({ length: 7 }).map((_, index) => (
        <div key={index} className="flex h-9 items-center gap-2 px-2.5">
          <Skeleton className="size-4 shrink-0 rounded-sm" />

          <Skeleton
            className="h-4 rounded-sm"
            style={{
              width: `${64 + ((index * 13) % 30)}%`,
            }}
          />
        </div>
      ))}
    </div>
  )
}

interface DocumentSidebarErrorProps {
  readonly isFetching: boolean
  readonly onRetry: () => void
}

/**
 * Renders a recoverable document navigation error state.
 */
function DocumentSidebarError({
  isFetching,
  onRetry,
}: DocumentSidebarErrorProps) {
  return (
    <div className="px-2 py-8 text-center">
      <p className="text-sm text-muted-foreground">Unable to load documents.</p>

      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={onRetry}
        disabled={isFetching}
        className="mt-2 gap-2"
      >
        <RefreshCw className={cn('size-3.5', isFetching && 'animate-spin')} />

        <span>Try again</span>
      </Button>
    </div>
  )
}

interface DocumentSidebarEmptyProps {
  readonly href: string
}

/**
 * Renders the empty state shown when the user has no documents.
 */
function DocumentSidebarEmpty({ href }: DocumentSidebarEmptyProps) {
  return (
    <div className="px-2 py-8 text-center">

      <p className="mt-2 text-sm font-medium">No documents yet</p>

      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
        Create your first document to get started.
      </p>

      <div className="flex justify-center">
        <Link href={href}>
          <Button variant="outline" size="lg" className="px-6">
            <Plus className="size-4" />
            Create Doc
          </Button>
        </Link>
      </div>
    </div>
  )
}
