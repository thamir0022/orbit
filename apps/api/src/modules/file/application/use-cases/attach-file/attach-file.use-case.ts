import { Inject, Injectable } from '@nestjs/common'
import {
  Attachment,
  AttachmentPlacement,
  AttachmentTarget,
  FileId,
  FileScopeType,
  FileStatus,
} from '@/modules/file/domain'
import { UserId } from '@/modules/user/domain'
import { WorkspaceId } from '@/modules/workspace/domain'
import { retryRepositoryConflict } from '../../services/repository-conflict-retry'
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

export interface AttachFileInput {
  readonly actor: FileActor
  readonly fileId: string
  readonly target: AttachmentTarget
  readonly placement?: AttachmentPlacement
  readonly displayName?: string
}

/** Creates an authorized workspace attachment without duplicating stored bytes. */
@Injectable()
export class AttachFile {
  constructor(
    @Inject(FILE_UNIT_OF_WORK) private readonly work: FileUnitOfWork,
    @Inject(FILE_AUTHORIZATION)
    private readonly authorization: FileAuthorizationPort
  ) {}

  async execute(
    input: AttachFileInput
  ): Promise<{ attachmentId: string; fileId: string }> {
    if (!input.actor.workspaceId) {
      throw new FileApplicationError(
        FileApplicationErrorCode.FORBIDDEN,
        'Select a workspace'
      )
    }
    const fileId = FileId.create(input.fileId)
    const workspaceId = WorkspaceId.create(input.actor.workspaceId)
    return retryRepositoryConflict(() =>
      this.work.execute(async (repos) => {
        const found = await repos.files.findById(fileId)
        const file = found?.entity
        if (
          !found ||
          !file ||
          file.status !== FileStatus.READY ||
          file.scope.type !== FileScopeType.WORKSPACE ||
          file.scope.id !== input.actor.workspaceId
        ) {
          throw new FileApplicationError(
            FileApplicationErrorCode.NOT_FOUND,
            'File not found'
          )
        }
        await this.authorization.assertCanAttach({
          actor: input.actor,
          file,
          target: input.target,
        })
        const existing = await repos.attachments.findActiveLink({
          workspaceId,
          target: input.target,
          fileId,
        })
        if (existing)
          return {
            attachmentId: existing.entity.id.value,
            fileId: fileId.value,
          }
        const attachment = Attachment.create({
          workspaceId,
          fileId,
          target: input.target,
          placement: input.placement,
          displayName: input.displayName ?? file.originalName,
          position: await repos.attachments.nextPosition({
            workspaceId,
            target: input.target,
          }),
          createdBy: UserId.create(input.actor.userId),
        })
        await repos.attachments.insert(attachment)
        // Serialize link changes on their shared file to prevent last-reference races.
        await repos.files.update(file, found.revision)
        return { attachmentId: attachment.id.value, fileId: fileId.value }
      })
    )
  }
}
