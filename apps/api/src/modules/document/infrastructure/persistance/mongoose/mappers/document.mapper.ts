import { UserId } from '@/modules/user/domain'
import { WorkspaceId } from '@/modules/workspace/domain'

import { Document } from '../../../../domain/entities/document.entity'
import { DocumentId } from '../../../../domain/value-objects/document-id.vo'
import { DocumentDocument } from '../schemas/document.schema'

/**
 * Maps document data between the domain and persistence layers.
 */
export class DocumentMapper {
  /**
   * Reconstitutes a document aggregate from its persisted representation.
   */
  static toDomainDto(document: DocumentDocument): Document {
    return Document.reconstitute({
      id: DocumentId.fromString(document.id),
      workspaceId: WorkspaceId.fromString(document.workspaceId),
      ownerId: UserId.fromString(document.ownerId),

      title: document.title,
      content: document.content,

      createdBy: UserId.fromString(document.createdBy),
      updatedBy: UserId.fromString(document.updatedBy),

      deletedAt: document.deletedAt ?? null,
      deletedBy: document.deletedBy
        ? UserId.fromString(document.deletedBy)
        : null,

      createdAt: document.createdAt,
      updatedAt: document.updatedAt,
    })
  }

  /**
   * Converts a document aggregate into its persistence representation.
   */
  static toPersistance(document: Document): Partial<DocumentDocument> {
    return {
      id: document.id.value,
      workspaceId: document.workspaceId.value,
      ownerId: document.ownerId.value,

      title: document.title,
      content: document.content,

      createdBy: document.createdBy.value,
      updatedBy: document.updatedBy.value,

      deletedAt: document.deletedAt,
      deletedBy: document.deletedBy?.value ?? null,

      createdAt: document.createdAt,
      updatedAt: document.updatedAt,
    }
  }
}
