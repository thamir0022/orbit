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

import { DeleteDocumentInput } from './delete-document.input'
import { IDeleteDocumentUseCase } from './delete-document.interface'

/**
 * Soft deletes a private document owned by the authenticated user.
 *
 * The use case coordinates workspace validation, document ownership
 * validation, transactional persistence, and aggregate lifecycle changes.
 * The Document aggregate remains responsible for its own deletion rules.
 */
@Injectable()
export class DeleteDocumentUseCase implements IDeleteDocumentUseCase {
  constructor(
    @Inject(WORKSPACE_REPOSITORY)
    private readonly workspaceRepository: IWorkspaceRepository,

    @Inject(DOCUMENT_REPOSITORY)
    private readonly documentRepository: DocumentRepository,

    @Inject(TRANSACTION_MANAGER)
    private readonly transactionManager: ITransactionManager
  ) {}

  async execute(input: DeleteDocumentInput): Promise<void> {
    const workspaceId = WorkspaceId.create(input.workspaceId)
    const documentId = DocumentId.create(input.documentId)
    const actorId = UserId.create(input.actorId)

    /**
     * Validate workspace state before modifying a workspace resource.
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
     * The workspace constraint guarantees that the document belongs
     * to the current tenant before it can be modified.
     */
    const document = await this.documentRepository.findByWorkspaceIdAndId({
      workspaceId,
      documentId,
    })

    /**
     * Private documents can only be deleted by their owner.
     *
     * Returning "not found" for a non-owner avoids exposing the
     * existence of another user's private document.
     */
    if (!document || document.ownerId.value !== actorId.value) {
      throw new DocumentNotFoundException()
    }

    /**
     * Soft delete and persist the aggregate atomically.
     *
     * Document.delete() owns the document lifecycle rules and records
     * deletion audit information such as deletedBy and deletedAt.
     */
    await this.transactionManager.executeTransaction(async (session) => {
      document.delete(actorId)

      await this.documentRepository.save(document, {
        session,
      })
    })
  }
}
