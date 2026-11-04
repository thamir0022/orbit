import { Inject, Injectable } from '@nestjs/common'
import { AttachmentId } from '@/modules/file/domain'
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

/** Soft-deletes a link without deleting a file still used elsewhere. */
@Injectable()
export class RemoveAttachment {
  constructor(
    @Inject(ATTACHMENT_REPOSITORY)
    private readonly attachments: AttachmentRepository,
    @Inject(FILE_AUTHORIZATION)
    private readonly authorization: FileAuthorizationPort
  ) {}

  async execute(input: {
    actor: FileActor
    attachmentId: string
  }): Promise<void> {
    const found = await this.attachments.findById(
      AttachmentId.create(input.attachmentId)
    )
    if (
      !found ||
      found.entity.deletedAt ||
      !input.actor.workspaceId ||
      found.entity.workspaceId.value !== input.actor.workspaceId
    ) {
      throw new FileApplicationError(
        FileApplicationErrorCode.NOT_FOUND,
        'Attachment not found'
      )
    }
    await this.authorization.assertCanRemoveAttachment({
      actor: input.actor,
      attachment: found.entity,
    })
    found.entity.remove()
    await this.attachments.update(found.entity, found.revision)
  }
}
