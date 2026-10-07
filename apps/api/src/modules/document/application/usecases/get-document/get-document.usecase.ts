import { Inject, Injectable } from '@nestjs/common'

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

import { DocumentNotFoundException } from '../../../domain/exceptions/document-not-found.exception'

import { DocumentId } from '@/modules/document/domain/value-objects/document-id.vo'

import {
  DOCUMENT_QUERY_REPOSITORY,
  DocumentQueryRepository,
} from '../../ports/document-query-repository.port'

import { IGetDocumentUseCase } from './get-document.interface'
import { GetDocumentInput } from './get-document.input'
import { GetDocumentOutput } from './get-document.output'

/**
 * Retrieves a private document owned by the authenticated user.
 *
 * The use case coordinates workspace validation and owner-scoped document
 * retrieval. Access to another user's private document is intentionally
 * represented as not found to avoid exposing resource existence.
 */
@Injectable()
export class GetDocumentUseCase implements IGetDocumentUseCase {
  constructor(
    @Inject(WORKSPACE_REPOSITORY)
    private readonly workspaceRepository: IWorkspaceRepository,

    @Inject(DOCUMENT_QUERY_REPOSITORY)
    private readonly documentQueryRepository: DocumentQueryRepository
  ) {}

  async execute(input: GetDocumentInput): Promise<GetDocumentOutput> {
    const workspaceId = WorkspaceId.create(input.workspaceId)
    const documentId = DocumentId.create(input.documentId)
    const ownerId = UserId.create(input.actorId)

    /**
     * Validate workspace state before accessing workspace resources.
     */
    const workspace = await this.workspaceRepository.findById(workspaceId)

    if (!workspace) {
      throw new WorkspaceNotFoundException()
    }

    if (workspace.status !== WorkspaceStatus.ACTIVE) {
      throw new WorkspaceNotActiveException(workspace.status)
    }

    /**
     * Retrieve the document through the owner-scoped read repository.
     *
     * Keeping ownerId in the query guarantees that private documents
     * cannot be retrieved merely by knowing their identifier.
     */
    const document =
      await this.documentQueryRepository.findByWorkspaceIdAndOwnerIdAndId({
        workspaceId,
        ownerId,
        documentId,
      })

    if (!document) {
      throw new DocumentNotFoundException()
    }

    return {
      document,
    }
  }
}
