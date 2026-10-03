import { UserId } from '@/modules/user/domain'
import { WorkspaceId } from '@/modules/workspace/domain'
import { AggregateRoot } from '@/shared/domain'

import {
  CreateDocumentProps,
  DocumentContent,
  DocumentProps,
  UpdateDocumentProps,
} from '../interfaces/document.interface'
import { DocumentId } from '../value-objects/document-id.vo'

/**
 * Represents a user-owned rich-text document within a workspace.
 *
 * The document aggregate owns its content and lifecycle state, while
 * relationships with projects, comments, and other contexts are modeled
 * outside the aggregate through dedicated association entities.
 */
export class Document extends AggregateRoot<DocumentId> {
  private readonly _workspaceId: WorkspaceId
  private readonly _ownerId: UserId

  private _title: string
  private _content: DocumentContent

  private readonly _createdBy: UserId
  private _updatedBy: UserId

  private _deletedAt: Date | null
  private _deletedBy: UserId | null

  private readonly _createdAt: Date
  private _updatedAt: Date

  /**
   * Creates a document aggregate from a complete domain state.
   *
   * This constructor is used for both creating new documents and
   * reconstituting existing documents from persistent storage.
   */
  constructor(props: DocumentProps) {
    super(props.id)

    this._workspaceId = props.workspaceId
    this._ownerId = props.ownerId

    this._title = props.title
    this._content = props.content

    this._createdBy = props.createdBy
    this._updatedBy = props.updatedBy

    this._deletedAt = props.deletedAt
    this._deletedBy = props.deletedBy

    this._createdAt = props.createdAt
    this._updatedAt = props.updatedAt
  }

  /**
   * Creates a new document aggregate.
   *
   * Initializes ownership, content, audit fields, and lifecycle state
   * for a newly created document.
   */
  static create(props: CreateDocumentProps): Document {
    const documentId = DocumentId.create()
    const now = new Date()

    const workspaceId = WorkspaceId.create(props.workspaceId)
    const ownerId = UserId.create(props.ownerId)
    const createdBy = UserId.create(props.createdBy)

    return new Document({
      id: documentId,
      workspaceId,

      ownerId,

      title: props.title ?? 'Untitled',
      content: props.content,

      createdBy,
      updatedBy: createdBy,

      deletedAt: null,
      deletedBy: null,

      createdAt: now,
      updatedAt: now,
    })
  }

  /**
   * Updates the mutable document fields.
   *
   * A deleted document cannot be modified. When a valid update is applied,
   * the modifying user and last-updated timestamp are recorded.
   */
  updateDocument(props: UpdateDocumentProps): void {
    this._title = props.title ?? this._title
    this._content = props.content ?? this._content

    const updatedBy = UserId.create(props.updatedBy)

    this.touch(updatedBy)
  }

  /**
   * Soft deletes the document.
   *
   * Records the deletion actor and timestamp while preserving the document
   * for auditability and potential restoration.
   */
  delete(userId: UserId): void {
    this._deletedAt = new Date()
    this._deletedBy = userId

    this.touch(userId)
  }

  /**
   * Restores a previously deleted document.
   *
   * Clears the deletion state and records the user responsible for
   * restoring the document.
   */
  restore(userId: UserId): void {
    this._deletedAt = null
    this._deletedBy = null

    this.touch(userId)
  }

  /**
   * Indicates whether the document has been soft deleted.
   */
  isDeleted(): boolean {
    return this._deletedAt !== null
  }

  get id(): DocumentId {
    return this._id
  }

  get workspaceId(): WorkspaceId {
    return this._workspaceId
  }

  get ownerId(): UserId {
    return this._ownerId
  }

  get title(): string {
    return this._title
  }

  get content(): DocumentContent {
    return this._content
  }

  get createdBy(): UserId {
    return this._createdBy
  }

  get updatedBy(): UserId {
    return this._updatedBy
  }

  get createdAt(): Date {
    return this._createdAt
  }

  get updatedAt(): Date {
    return this._updatedAt
  }

  get deletedAt(): Date | null {
    return this._deletedAt
  }

  get deletedBy(): UserId | null {
    return this._deletedBy
  }

  /**
   * Reconstitutes a document aggregate from persisted state.
   *
   * Repository implementations should use this method when rebuilding
   * an existing document from the persistence layer.
   */
  static reconstitute(props: DocumentProps): Document {
    return new Document(props)
  }

  private touch(updatedBy: UserId) {
    this._updatedAt = new Date()
    this._updatedBy = updatedBy
  }
}
