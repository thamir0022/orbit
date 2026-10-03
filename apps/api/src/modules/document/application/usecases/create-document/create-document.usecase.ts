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

import { Document } from '../../../domain/entities/document.entity'
import { DocumentNotFoundException } from '../../../domain/exceptions'

import {
  DOCUMENT_REPOSITORY,
  DocumentRepository,
} from '../../ports/document-repository.port'

import {
  DOCUMENT_QUERY_REPOSITORY,
  DocumentQueryRepository,
} from '../../ports/document-query-repository.port'

import { CreateDocumentInput } from './create-document.input'
import { CreateDocumentOutput } from './create-document.output'
import { ICreateDocumentUseCase } from './create-document.interface'

/**
 * Creates a new private document for a user within a workspace.
 *
 * The use case coordinates workspace validation, document creation,
 * transactional persistence, and retrieval of the final read projection.
 * Domain invariants remain encapsulated by the Document aggregate.
 */
@Injectable()
export class CreateDocumentUseCase implements ICreateDocumentUseCase {
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

  async execute(input: CreateDocumentInput): Promise<CreateDocumentOutput> {
    const workspaceId = WorkspaceId.create(input.workspaceId)
    const actorId = UserId.create(input.actorId)

    /**
     * Validate workspace state before creating the document.
     */
    const workspace = await this.workspaceRepository.findById(workspaceId)

    if (!workspace) {
      throw new WorkspaceNotFoundException()
    }

    if (workspace.status !== WorkspaceStatus.ACTIVE) {
      throw new WorkspaceNotActiveException(workspace.status)
    }

    /**
     * Create and persist the document atomically.
     *
     * The actor becomes both the creator and owner of the document,
     * making newly created documents private to that user until an
     * explicit project or other sharing association is created.
     */
    const document = await this.transactionManager.executeTransaction(
      async (session) => {
        const newDocument = Document.create({
          workspaceId: workspaceId.value,
          ownerId: actorId.value,
          title: input.title,
          content: input.content,
          createdBy: actorId.value,
        })

        await this.documentRepository.save(newDocument, {
          session,
        })

        return newDocument
      }
    )

    /**
     * Read the committed document through the optimized query repository.
     *
     * The query-side projection provides the enriched application output
     * without exposing the domain aggregate to the caller.
     */
    const result =
      await this.documentQueryRepository.findByWorkspaceIdAndOwnerIdAndId({
        workspaceId,
        ownerId: actorId,
        documentId: document.id,
      })

    if (!result) {
      throw new DocumentNotFoundException()
    }

    return {
      document: result,
    }
  }
}
