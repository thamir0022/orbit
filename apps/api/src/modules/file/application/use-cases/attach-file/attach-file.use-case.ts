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
    return this.work.execute(async (repos) => {
      const found = await repos.files.findById(fileId)
      const file = found?.entity
      if (
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
      const attachment = Attachment.create({
        workspaceId: WorkspaceId.create(input.actor.workspaceId),
        fileId,
        target: input.target,
        placement: input.placement,
        displayName: input.displayName,
        createdBy: UserId.create(input.actor.userId),
      })
      await repos.attachments.insert(attachment)
      return { attachmentId: attachment.id.value, fileId: fileId.value }
    })
  }
}
