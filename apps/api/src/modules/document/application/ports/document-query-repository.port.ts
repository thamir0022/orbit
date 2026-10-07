import { ITransactionOptions } from '@/shared/application'

import { UserId } from '@/modules/user/domain'
import { WorkspaceId } from '@/modules/workspace/domain'

import { DocumentId } from '../../domain/value-objects/document-id.vo'
import { DocumentListItemOutput } from '../contracts/document-list-item.output'
import { DocumentSummaryOutput } from '../contracts/document-summary.output'

/**
 * Defines the query parameters for finding a document owned by a user
 * within a specific workspace.
 */
export interface FindDocumentByWorkspaceIdAndOwnerIdAndIdQueryProps {
  readonly workspaceId: WorkspaceId
  readonly ownerId: UserId
  readonly documentId: DocumentId
}

/**
 * Read-only query repository for retrieving document projections.
 *
 * Provides optimized application-facing queries without exposing
 * domain aggregates to read use cases.
 */
export interface DocumentQueryRepository {
  /**
   * Finds all active documents owned by a user within a workspace.
   */
  findByWorkspaceIdAndOwnerId(
    workspaceId: WorkspaceId,
    ownerId: UserId,
    options?: ITransactionOptions
  ): Promise<readonly DocumentListItemOutput[]>

  /**
   * Finds a single active document owned by a user within a workspace.
   */
  findByWorkspaceIdAndOwnerIdAndId(
    props: FindDocumentByWorkspaceIdAndOwnerIdAndIdQueryProps,
    options?: ITransactionOptions
  ): Promise<DocumentListItemOutput | null>

  /**
   * Finds lightweight document summaries owned by a user within a workspace.
   *
   * Intended for document navigation and other contexts where only
   * the document identifier and title are required.
   */
  findSummariesByWorkspaceIdAndOwnerId(
    workspaceId: WorkspaceId,
    ownerId: UserId,
    options?: ITransactionOptions
  ): Promise<readonly DocumentSummaryOutput[]>
}

export const DOCUMENT_QUERY_REPOSITORY = Symbol('DocumentQueryRepository')
