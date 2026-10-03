import { WorkspaceId } from '@/modules/workspace/domain'
import { UserId } from '@/modules/user/domain'

import { IBaseRepository, ITransactionOptions } from '@/shared/application'

import { Document } from '../../domain/entities/document.entity'
import { DocumentId } from '../../domain/value-objects/document-id.vo'

export interface FindDocumentByWorkspaceIdAndIdProps {
  readonly workspaceId: WorkspaceId
  readonly documentId: DocumentId
}

export interface FindDocumentsByWorkspaceIdAndOwnerIdProps {
  readonly workspaceId: WorkspaceId
  readonly ownerId: UserId
}

/**
 * Repository port for persisting and retrieving document aggregates.
 *
 * Provides the persistence contract required by the application layer
 * while keeping the infrastructure implementation independent of the domain.
 */
export interface DocumentRepository extends IBaseRepository<
  Document,
  DocumentId
> {
  /**
   * Finds a document by its identifier within a workspace.
   */
  findByWorkspaceIdAndId(
    props: FindDocumentByWorkspaceIdAndIdProps,
    options?: ITransactionOptions
  ): Promise<Document | null>

  /**
   * Finds all documents owned by a user within a workspace.
   */
  findByWorkspaceIdAndOwnerId(
    props: FindDocumentsByWorkspaceIdAndOwnerIdProps,
    options?: ITransactionOptions
  ): Promise<readonly Document[]>
}

export const DOCUMENT_REPOSITORY = Symbol('DocumentRepository')
