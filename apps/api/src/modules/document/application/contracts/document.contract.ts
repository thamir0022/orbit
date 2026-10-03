import { DocumentContent } from '../../domain/interfaces/document.interface'

/**
 * Application layer contract representing a document.
 *
 * Provides the document state in an application-friendly format,
 * decoupled from domain value objects and aggregate implementation details.
 */
export interface DocumentContract {
  readonly id: string
  readonly workspaceId: string

  readonly ownerId: string

  readonly title: string
  readonly content: DocumentContent

  readonly createdBy: string
  readonly updatedBy: string

  readonly createdAt: Date
  readonly updatedAt: Date

  readonly deletedAt: Date | null
  readonly deletedBy: string | null
}
