import { Inject, Injectable } from '@nestjs/common'
import { AttachmentId } from '@/modules/file/domain'
import {
  FILE_UNIT_OF_WORK,
  type FileUnitOfWork,
} from '../../ports/repositories/file-unit-of-work.port'
import {
  FILE_AUTHORIZATION,
  type FileActor,
  type FileAuthorizationPort,
} from '../../ports/file-authorization.port'
import {
  FileApplicationError,
  FileApplicationErrorCode,
} from '../../errors/file-application.error'
import { RepositoryConflictError } from '../../ports/repositories/repository-snapshot'

@Injectable()
export class UpdateAttachment {
  constructor(
    @Inject(FILE_UNIT_OF_WORK) private readonly work: FileUnitOfWork,
    @Inject(FILE_AUTHORIZATION)
    private readonly authorization: FileAuthorizationPort
  ) {}

  async execute(input: {
    actor: FileActor
    attachmentId: string
    displayName: string
    revision: number
  }): Promise<void> {
    return this.work.execute(async (repos) => {
      const record = await repos.attachments.findById(
        AttachmentId.create(input.attachmentId)
      )
      if (
        !record ||
        record.entity.deletedAt ||
        record.entity.workspaceId.value !== input.actor.workspaceId
      ) {
        throw new FileApplicationError(
          FileApplicationErrorCode.NOT_FOUND,
          'Attachment not found'
        )
      }
      await this.authorization.assertCanManageAttachments({
        actor: input.actor,
        target: record.entity.target,
      })
      if (record.revision !== input.revision)
        throw new RepositoryConflictError()
      record.entity.rename(input.displayName)
      await repos.attachments.update(record.entity, record.revision)
    })
  }
}
