'use client'

import Link from 'next/link'
import { useParams, usePathname, useRouter } from 'next/navigation'
import {
  MoreHorizontal,
  PanelLeftClose,
  Plus,
  RefreshCw,
  Trash2,
} from 'lucide-react'
import { useCallback, useState } from 'react'

import { useDocumentsQuery, type DocumentSummary } from '@/entities/document'

import { DocumentDeleteDialog } from '@/features/document/delete-document'

import { cn } from '@/shared/lib/utils'
import { Button } from '@/shared/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu'
import { ScrollArea } from '@/shared/ui/scroll-area'
import { Separator } from '@/shared/ui/separator'
import { Skeleton } from '@/shared/ui/skeleton'

interface DocsSidebarProps {
  readonly isOpen: boolean
  readonly onClose: () => void
}

/**
 * Renders the persistent document navigation sidebar.
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
      aria-label="Documents sidebar"
      aria-hidden={!isOpen}
      className={cn(
        'relative flex min-h-0 w-72 shrink-0 flex-col',
        'overflow-hidden border-r bg-background',
        'transition-[width,border-color]',
        'duration-300 ease-out',
        'motion-reduce:transition-none',
        isOpen ? 'w-72' : 'w-0 border-transparent'
      )}
    >
      <div
        inert={!isOpen}
        className={cn(
          'flex h-full min-h-0 w-72 min-w-0 flex-col',
          'overflow-hidden',
          'transition-[opacity,transform]',
          'duration-300 ease-out',
          'motion-reduce:transition-none',
          isOpen
            ? 'translate-x-0 opacity-100'
            : 'pointer-events-none -translate-x-3 opacity-0'
        )}
      >
        <header className="flex shrink-0 flex-col">
          <div className="flex min-w-0 items-center justify-between gap-2 px-3 py-3">
            <h2 className="min-w-0 truncate text-lg font-semibold tracking-tight">
              Docs
            </h2>

            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label="Close documents sidebar"
              aria-controls="docs-sidebar"
              aria-expanded={isOpen}
              onClick={onClose}
              className={cn(
                'shrink-0',
                'bg-transparent hover:bg-transparent',
                'active:bg-transparent',
                'focus-visible:bg-transparent'
              )}
            >
              <PanelLeftClose aria-hidden="true" className="size-4" />
            </Button>
          </div>

          <Separator />
        </header>

        <ScrollArea
          className={cn(
            'min-h-0 min-w-0 flex-1',
            '[&>[data-radix-scroll-area-viewport]]:min-w-0',
            '[&>[data-radix-scroll-area-viewport]>div]:!block'
          )}
        >
          <div className="min-w-0 px-2 py-4">
            <Link
              href={newDocumentPath}
              aria-label="Create a new document"
              className="block w-full"
            >
              <Button variant="ghost" size="lg" className="w-full">
                <Plus aria-hidden="true" className="size-4" />
                <span>New document</span>
              </Button>
            </Link>
          </div>

          <section
            aria-labelledby="my-documents-heading"
            className="min-w-0 px-2 pb-4"
          >
            <div className="px-2 pb-2">
              <h3
                id="my-documents-heading"
                className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground"
              >
                My documents
              </h3>
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
          </section>
        </ScrollArea>
      </div>
    </aside>
  )
}

interface DocumentSidebarListProps {
  readonly documents: readonly DocumentSummary[]
  readonly pathname: string
  readonly basePath: string
}

/**
 * Renders document navigation items and document actions.
 */
function DocumentSidebarList({
  documents,
  pathname,
  basePath,
}: DocumentSidebarListProps) {
  const router = useRouter()

  const [documentToDelete, setDocumentToDelete] =
    useState<DocumentSummary | null>(null)

  const handleDeleted = useCallback(
    (documentId: string) => {
      setDocumentToDelete(null)

      const deletedDocumentPath = `${basePath}/${documentId}`

      if (pathname === deletedDocumentPath) {
        router.replace(`${basePath}/new`)
      }
    },
    [basePath, pathname, router]
  )

  return (
    <>
      <nav aria-label="My documents" className="min-w-0">
        <ul role="list" className="m-0 min-w-0 list-none space-y-0.5 p-0">
          {documents.map((document) => {
            const href = `${basePath}/${document.id}`
            const title = document.title || 'Untitled'
            const isActive = pathname === href

            return (
              <li key={document.id} className="min-w-0">
                <div className="group relative min-w-0">
                  <Link
                    href={href}
                    aria-current={isActive ? 'page' : undefined}
                    aria-label={`Open document ${title}`}
                    title={title}
                    className={cn(
                      'flex h-9 min-w-0 w-full items-center',
                      'rounded-md pl-2.5 pr-9',
                      'text-sm transition-colors',
                      'focus-visible:outline-none',
                      'focus-visible:ring-2',
                      'focus-visible:ring-ring',
                      isActive
                        ? 'bg-muted font-medium text-foreground'
                        : [
                            'text-muted-foreground',
                            'hover:bg-muted/70',
                            'hover:text-foreground',
                          ]
                    )}
                  >
                    <span className="min-w-0 flex-1 truncate">{title}</span>
                  </Link>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`Actions for ${title}`}
                        aria-controls={`document-actions-${document.id}`}
                        className={cn(
                          'absolute right-1 top-1/2',
                          'size-7 -translate-y-1/2',
                          'shrink-0',
                          'bg-transparent hover:bg-muted',
                          'opacity-0 transition-opacity duration-150',
                          'group-hover:opacity-100',
                          'group-focus-within:opacity-100',
                          'data-[state=open]:opacity-100'
                        )}
                      >
                        <MoreHorizontal aria-hidden="true" className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent
                      id={`document-actions-${document.id}`}
                      align="end"
                      side="right"
                      sideOffset={4}
                      className="w-36"
                    >
                      <DropdownMenuItem
                        variant="destructive"
                        onSelect={() => {
                          setDocumentToDelete(document)
                        }}
                      >
                        <Trash2 /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </li>
            )
          })}
        </ul>
      </nav>

      <DocumentDeleteDialog
        document={documentToDelete}
        open={documentToDelete !== null}
        onOpenChange={(open) => {
          if (!open) {
            setDocumentToDelete(null)
          }
        }}
        onDeleted={handleDeleted}
      />
    </>
  )
}

/**
 * Renders the document navigation loading state.
 */
function DocumentSidebarSkeleton() {
  return (
    <div
      role="status"
      aria-label="Loading documents"
      className="min-w-0 space-y-1"
    >
      {Array.from({ length: 7 }).map((_, index) => (
        <div key={index} className="flex h-9 min-w-0 items-center px-2.5">
          <Skeleton className="h-4 min-w-0 rounded-sm" />
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
    <div role="alert" className="min-w-0 px-2 py-8 text-center">
      <p className="text-sm text-muted-foreground">Unable to load documents.</p>

      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={onRetry}
        disabled={isFetching}
        aria-label="Retry loading documents"
        className="mt-2 gap-2"
      >
        <RefreshCw
          aria-hidden="true"
          className={cn('size-3.5', isFetching && 'animate-spin')}
        />

        <span>{isFetching ? 'Retrying...' : 'Try again'}</span>
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
    <div className="min-w-0 px-2 py-8 text-center">
      <p className="text-sm font-medium">No documents yet</p>

      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
        Create your first document to get started.
      </p>
    </div>
  )
}
