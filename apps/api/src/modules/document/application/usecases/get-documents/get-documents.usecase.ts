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

import {
  DOCUMENT_QUERY_REPOSITORY,
  DocumentQueryRepository,
} from '../../ports/document-query-repository.port'

import { GetDocumentsInput } from './get-documents.input'
import { GetDocumentsOutput } from './get-documents.output'
import { IGetDocumentsUseCase } from './get-documents.interface'

/**
 * Retrieves all active documents owned by the authenticated user
 * within the current workspace.
 *
 * The use case coordinates workspace validation and delegates the
 * read operation to a lightweight query-side projection.
 */
@Injectable()
export class GetDocumentsUseCase implements IGetDocumentsUseCase {
  constructor(
    @Inject(WORKSPACE_REPOSITORY)
    private readonly workspaceRepository: IWorkspaceRepository,

    @Inject(DOCUMENT_QUERY_REPOSITORY)
    private readonly documentQueryRepository: DocumentQueryRepository
  ) {}

  async execute(input: GetDocumentsInput): Promise<GetDocumentsOutput> {
    const workspaceId = WorkspaceId.create(input.workspaceId)
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
     * Retrieve only the fields required by the document navigation list.
     *
     * The query remains owner-scoped so private documents belonging
     * to other users cannot be returned.
     */
    const documents =
      await this.documentQueryRepository.findSummariesByWorkspaceIdAndOwnerId(
        workspaceId,
        ownerId
      )

    return {
      documents,
    }
  }
}
