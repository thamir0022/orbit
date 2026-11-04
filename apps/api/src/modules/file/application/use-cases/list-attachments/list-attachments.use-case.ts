import { Inject, Injectable } from '@nestjs/common'
import { AttachmentTarget } from '@/modules/file/domain'
import { WorkspaceId } from '@/modules/workspace/domain'
import {
  ATTACHMENT_REPOSITORY,
  type AttachmentRepository,
} from '../../ports/repositories/attachment-repository.port'
import {
  FILE_AUTHORIZATION,
  type FileActor,
  type FileAuthorizationPort,
} from '../../ports/file-authorization.port'
import {
  FileApplicationError,
  FileApplicationErrorCode,
} from '../../errors/file-application.error'

export interface ListedAttachment {
  readonly id: string
  readonly fileId: string
  readonly displayName: string | null
  readonly placement: string
  readonly createdAt: Date
}

/** Lists only attachments visible through the authorized business target. */
@Injectable()
export class ListAttachments {
  constructor(
    @Inject(ATTACHMENT_REPOSITORY)
    private readonly attachments: AttachmentRepository,
    @Inject(FILE_AUTHORIZATION)
    private readonly authorization: FileAuthorizationPort
  ) {}

  async execute(input: {
    actor: FileActor
    target: AttachmentTarget
    limit: number
  }): Promise<readonly ListedAttachment[]> {
    if (!input.actor.workspaceId) {
      throw new FileApplicationError(
        FileApplicationErrorCode.FORBIDDEN,
        'Select a workspace'
      )
    }
    await this.authorization.assertCanListAttachments({
      actor: input.actor,
      target: input.target,
    })
    const records = await this.attachments.findActiveByTarget({
      workspaceId: WorkspaceId.create(input.actor.workspaceId),
      target: input.target,
      limit: input.limit,
    })
    return records.map(({ entity }) => ({
      id: entity.id.value,
      fileId: entity.fileId.value,
      displayName: entity.displayName,
      placement: entity.placement,
      createdAt: entity.createdAt,
    }))
  }
}
