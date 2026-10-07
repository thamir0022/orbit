import { Inject, Injectable } from '@nestjs/common'

import { ITransactionManager, TRANSACTION_MANAGER } from '@/shared/application'

import {
  IWorkspaceRepository,
  WORKSPACE_REPOSITORY,
} from '@/modules/workspace/application'

import { WorkspaceId, WorkspaceStatus } from '@/modules/workspace/domain'

import {
  WorkspaceNotActiveException,
  WorkspaceNotFoundException,
} from '@/modules/workspace/domain/exceptions/workspace.exception'

import { UserId } from '@/modules/user/domain'

import { DocumentId } from '../../../domain/value-objects/document-id.vo'
import { DocumentNotFoundException } from '../../../domain/exceptions/document-not-found.exception'

import {
  DOCUMENT_REPOSITORY,
  DocumentRepository,
} from '../../ports/document-repository.port'

import {
  DOCUMENT_QUERY_REPOSITORY,
  DocumentQueryRepository,
} from '../../ports/document-query-repository.port'

import { UpdateDocumentInput } from './update-document.input'
import { UpdateDocumentOutput } from './update-document.output'
import { IUpdateDocumentUseCase } from './update-document.interface'

/**
 * Updates an existing private document owned by the authenticated user.
 *
 * The use case coordinates workspace validation, document ownership
 * validation, transactional persistence, and retrieval of the updated
 * read projection. Document business rules remain inside the aggregate.
 */
@Injectable()
export class UpdateDocumentUseCase implements IUpdateDocumentUseCase {
  constructor(
    @Inject(WORKSPACE_REPOSITORY)
    private readonly workspaceRepository: IWorkspaceRepository,

    @Inject(DOCUMENT_REPOSITORY)
    private readonly documentRepository: DocumentRepository,

    @Inject(DOCUMENT_QUERY_REPOSITORY)
    private readonly documentQueryRepository: DocumentQueryRepository,

    @Inject(TRANSACTION_MANAGER)
    private readonly transactionManager: ITransactionManager
  ) {}

  async execute(input: UpdateDocumentInput): Promise<UpdateDocumentOutput> {
    const workspaceId = WorkspaceId.create(input.workspaceId)
    const documentId = DocumentId.create(input.documentId)
    const actorId = UserId.create(input.actorId)

    /**
     * Validate workspace state before modifying the document.
     */
    const workspace = await this.workspaceRepository.findById(workspaceId)

    if (!workspace) {
      throw new WorkspaceNotFoundException()
    }

    if (workspace.status !== WorkspaceStatus.ACTIVE) {
      throw new WorkspaceNotActiveException(workspace.status)
    }

    /**
     * Resolve the document through a workspace-scoped lookup.
     *
     * This guarantees that the document belongs to the current
     * workspace before any modification is attempted.
     */
    const document = await this.documentRepository.findByWorkspaceIdAndId({
      workspaceId,
      documentId,
    })

    /**
     * Private documents are only modifiable by their owner.
     *
     * Returning "not found" for a non-owner prevents leaking the
     * existence of another user's private document.
     */
    if (!document || !document.ownerId.equals(actorId)) {
      throw new DocumentNotFoundException()
    }

    /**
     * Update and persist the aggregate atomically.
     *
     * Document.updateDocument() remains responsible for document-level
     * invariants such as preventing changes to a deleted document and
     * maintaining modification audit fields.
     */
    const updatedDocument = await this.transactionManager.executeTransaction(
      async (session) => {
        document.updateDocument({
          title: input.title,
          content: input.content,
          updatedBy: actorId.value,
        })

        await this.documentRepository.save(document, {
          session,
        })

        return document
      }
    )

    /**
     * Read the committed document through the query repository.
     *
     * This ensures the response is produced from the same optimized
     * application read model used by document retrieval endpoints.
     */
    const result =
      await this.documentQueryRepository.findByWorkspaceIdAndOwnerIdAndId({
        workspaceId,
        ownerId: actorId,
        documentId: updatedDocument.id,
      })

    if (!result) {
      throw new DocumentNotFoundException()
    }

    return {
      document: result,
    }
  }
}
