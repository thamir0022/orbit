import { Inject, Injectable } from '@nestjs/common'
import { AttachmentId, FileScopeType } from '@/modules/file/domain'
import {
  FILE_UNIT_OF_WORK,
  type FileUnitOfWork,
} from '../../ports/repositories/file-unit-of-work.port'
import { retryRepositoryConflict } from '../../services/repository-conflict-retry'
import {
  FILE_AUTHORIZATION,
  type FileActor,
  type FileAuthorizationPort,
} from '../../ports/file-authorization.port'
import {
  FileApplicationError,
  FileApplicationErrorCode,
} from '../../errors/file-application.error'

/** Detaches immediately; the last reference schedules deferred disposal. */
@Injectable()
export class RemoveAttachment {
  constructor(
    @Inject(FILE_UNIT_OF_WORK)
    private readonly work: FileUnitOfWork,
    @Inject(FILE_AUTHORIZATION)
    private readonly authorization: FileAuthorizationPort
  ) {}

  async execute(input: {
    actor: FileActor
    attachmentId: string
  }): Promise<void> {
    const id = AttachmentId.create(input.attachmentId)
    await retryRepositoryConflict(() =>
      this.work.execute(async (repos) => {
        const found = await repos.attachments.findById(id)
        if (
          !found ||
          !input.actor.workspaceId ||
          found.entity.workspaceId.value !== input.actor.workspaceId
        ) {
          throw new FileApplicationError(
            FileApplicationErrorCode.NOT_FOUND,
            'Attachment not found'
          )
        }
        await this.authorization.assertCanManageAttachments({
          actor: input.actor,
          target: found.entity.target,
        })
        if (found.entity.deletedAt) return
        const file = await repos.files.findById(found.entity.fileId)
        if (
          !file ||
          file.entity.scope.type !== FileScopeType.WORKSPACE ||
          file.entity.scope.id !== input.actor.workspaceId
        ) {
          throw new FileApplicationError(
            FileApplicationErrorCode.NOT_FOUND,
            'File not found'
          )
        }
        found.entity.remove()
        await repos.attachments.update(found.entity, found.revision)
        if (!(await repos.attachments.hasActiveReferences(file.entity.id)))
          file.entity.delete()
        // Serialize every link change, including shared files, against concurrent attachment creation.
        await repos.files.update(file.entity, file.revision)
      })
    )
  }
}
