import { UserId } from '@/modules/user/domain'
import { WorkspaceId } from '@/modules/workspace/domain'

import { DocumentId } from '../value-objects/document-id.vo'

/**
 * Represents a JSON primitive value supported by a rich-text document.
 */
export type DocumentJsonPrimitive = string | number | boolean | null

/**
 * Represents a JSON object value used by document nodes and node attributes.
 */
export interface DocumentJsonObject {
  readonly [key: string]: DocumentJsonValue
}

/**
 * Represents a JSON array value used by document nodes and node attributes.
 */
export type DocumentJsonArray = readonly DocumentJsonValue[]

/**
 * Represents a valid JSON value used within a rich-text document.
 */
export type DocumentJsonValue =
  DocumentJsonPrimitive | DocumentJsonObject | DocumentJsonArray

/**
 * Represents a mark applied to a rich-text node.
 */
export interface DocumentMark {
  readonly type: string
  readonly attrs?: DocumentJsonObject
}

/**
 * Represents a node in the Tiptap-compatible rich-text document tree.
 */
export interface DocumentNode {
  readonly type: string
  readonly attrs?: DocumentJsonObject
  readonly content?: readonly DocumentNode[]
  readonly marks?: readonly DocumentMark[]
  readonly text?: string
}

/**
 * Represents the complete Tiptap-compatible document state.
 */
export interface DocumentContent {
  readonly type: 'doc'
  readonly content?: readonly DocumentNode[]
}

/**
 * Represents the complete state required to create a document aggregate.
 */
export interface CreateDocumentProps {
  readonly workspaceId: string
  readonly ownerId: string
  readonly title?: string
  readonly content: DocumentContent
  readonly createdBy: string
}

/**
 * Represents the complete persisted state required to reconstitute a document aggregate.
 */
export interface DocumentProps {
  readonly id: DocumentId
  readonly workspaceId: WorkspaceId
  readonly ownerId: UserId

  readonly title: string
  readonly content: DocumentContent

  readonly createdBy: UserId
  readonly updatedBy: UserId

  readonly deletedAt: Date | null
  readonly deletedBy: UserId | null

  readonly createdAt: Date
  readonly updatedAt: Date
}

/**
 * Represents the mutable fields allowed when updating a document.
 */
export interface UpdateDocumentProps {
  readonly title?: string
  readonly content?: DocumentContent
  readonly updatedBy: string
}
