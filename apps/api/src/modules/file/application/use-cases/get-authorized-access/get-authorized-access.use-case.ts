import { Inject, Injectable } from '@nestjs/common'
import {
  FILE_CONFIG,
  type IFileConfig,
} from '@/modules/file/application/ports/file-config.port'
import {
  AttachmentId,
  FileId,
  FileScopeType,
  FileStatus,
} from '@/modules/file/domain'
import {
  FileApplicationError,
  FileApplicationErrorCode,
} from '../../errors/file-application.error'
import type {
  FileActor,
  FileAuthorizationPort,
} from '../../ports/file-authorization.port'
import type { FileRepository } from '../../ports/repositories/file-repository.port'
import type { AttachmentRepository } from '../../ports/repositories/attachment-repository.port'
import type { ObjectStoragePort } from '../../ports/object-storage.port'
import { ATTACHMENT_REPOSITORY } from '@/modules/file/application/ports/repositories/attachment-repository.port'
import { FILE_REPOSITORY } from '@/modules/file/application/ports/repositories/file-repository.port'
import { OBJECT_STORAGE } from '@/modules/file/application/ports/object-storage.port'
import { FILE_AUTHORIZATION } from '@/modules/file/application/ports/file-authorization.port'

/** Resolves a private, temporary read grant only after business and attachment authorization. */
@Injectable()
export class GetAuthorizedAccess {
  constructor(
    @Inject(FILE_REPOSITORY) private readonly files: FileRepository,
    @Inject(ATTACHMENT_REPOSITORY)
    private readonly attachments: AttachmentRepository,
    @Inject(FILE_AUTHORIZATION)
    private readonly authorization: FileAuthorizationPort,
    @Inject(OBJECT_STORAGE) private readonly storage: ObjectStoragePort,
    @Inject(FILE_CONFIG) private readonly config: IFileConfig
  ) {}

  async execute(input: {
    fileId: string
    actor: FileActor
    attachmentId?: string
    disposition?: 'attachment' | 'inline'
  }): Promise<{
    readonly url: string
    readonly expiresAt: Date
    readonly mimeType: string
    readonly fileName: string
  }> {
    const found = await this.files.findById(FileId.create(input.fileId))
    const object = found?.entity.storageObject
    const mimeType = found?.entity.mimeType
    if (
      !found ||
      found.entity.status !== FileStatus.READY ||
      !object ||
      !mimeType
    ) {
      throw new FileApplicationError(
        FileApplicationErrorCode.NOT_FOUND,
        'File not found'
      )
    }
    const file = found.entity
    let attachment = null
    if (input.attachmentId) {
      const reference = await this.attachments.findById(
        AttachmentId.create(input.attachmentId)
      )
      if (
        !reference ||
        reference.entity.deletedAt ||
        reference.entity.fileId.value !== file.id.value ||
        file.scope.type !== FileScopeType.WORKSPACE ||
        reference.entity.workspaceId.value !== file.scope.id
      ) {
        throw new FileApplicationError(
          FileApplicationErrorCode.NOT_FOUND,
          'Attachment not found'
        )
      }
      attachment = reference.entity
    }
    // For unlinked workspace files the policy must verify a canonical feature reference (e.g. logo).
    await this.authorization.assertCanRead({
      actor: input.actor,
      file,
      attachment,
    })
    const grant = await this.storage.signRead({
      object,
      expiresInSeconds: this.config.accessExpiresInSeconds,
      downloadName: attachment?.displayName ?? file.originalName,
      disposition: input.disposition ?? 'attachment',
      mimeType: mimeType.value,
    })
    return {
      url: grant.url,
      expiresAt: grant.expiresAt,
      mimeType: mimeType.value,
      fileName: attachment?.displayName ?? file.originalName,
    }
  }
}
