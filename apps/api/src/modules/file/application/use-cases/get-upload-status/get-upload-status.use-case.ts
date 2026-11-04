import { Inject, Injectable } from '@nestjs/common'
import { FileScopeType, UploadSessionId } from '@/modules/file/domain'
import {
  FILE_REPOSITORY,
  type FileRepository,
} from '../../ports/repositories/file-repository.port'
import {
  UPLOAD_SESSION_REPOSITORY,
  type UploadSessionRepository,
} from '../../ports/repositories/upload-session-repository.port'
import {
  FILE_AUTHORIZATION,
  type FileActor,
  type FileAuthorizationPort,
} from '../../ports/file-authorization.port'
import {
  FileApplicationError,
  FileApplicationErrorCode,
} from '../../errors/file-application.error'

/** Returns processing status only to the initiating user with current scope access. */
@Injectable()
export class GetUploadStatus {
  constructor(
    @Inject(FILE_REPOSITORY) private readonly files: FileRepository,
    @Inject(UPLOAD_SESSION_REPOSITORY)
    private readonly uploads: UploadSessionRepository,
    @Inject(FILE_AUTHORIZATION)
    private readonly authorization: FileAuthorizationPort
  ) {}

  async execute(input: { actor: FileActor; sessionId: string }) {
    const session = (
      await this.uploads.findById(UploadSessionId.create(input.sessionId))
    )?.entity
    if (!session || session.initiatedBy.value !== input.actor.userId) {
      throw new FileApplicationError(
        FileApplicationErrorCode.NOT_FOUND,
        'Upload not found'
      )
    }
    const file = (await this.files.findById(session.fileId))?.entity
    if (
      !file ||
      (file.scope.type === FileScopeType.WORKSPACE &&
        file.scope.id !== input.actor.workspaceId)
    ) {
      throw new FileApplicationError(
        FileApplicationErrorCode.NOT_FOUND,
        'Upload not found'
      )
    }
    await this.authorization.assertCanCompleteUpload({
      actor: input.actor,
      file,
    })
    return {
      fileId: file.id.value,
      uploadStatus: session.status,
      fileStatus: file.status,
      sizeBytes: file.size?.bytes ?? null,
    }
  }
}
