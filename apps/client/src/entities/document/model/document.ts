import type { DocumentContent } from './document.types'

export interface Document {
  readonly id: string
  readonly workspaceId: string

  readonly title: string
  readonly content: DocumentContent

  readonly createdBy: string
  readonly updatedBy: string

  readonly createdAt: string
  readonly updatedAt: string

  readonly deletedAt: string | null
}

export interface DocumentSummary {
  readonly id: string
  readonly title: string
}
