import { Inject, Injectable } from '@nestjs/common'
import {
  FileId,
  FileScopeType,
  FileStatus,
  UploadSessionId,
  UploadSessionStatus,
} from '@/modules/file/domain'
import {
  FileApplicationError,
  FileApplicationErrorCode,
} from '../../errors/file-application.error'
import type { FileUnitOfWork } from '../../ports/repositories/file-unit-of-work.port'
import type { UploadSessionRepository } from '../../ports/repositories/upload-session-repository.port'
import type { ObjectStoragePort } from '../../ports/object-storage.port'
import type { FileProcessingDispatchPort } from '../../ports/file-processing-dispatch.port'
import { FILE_UNIT_OF_WORK } from '@/modules/file/application/ports/repositories/file-unit-of-work.port'
import { FILE_REPOSITORY } from '@/modules/file/application/ports/repositories/file-repository.port'
import { OBJECT_STORAGE } from '@/modules/file/application/ports/object-storage.port'
import { UPLOAD_SESSION_REPOSITORY } from '@/modules/file/application/ports/repositories/upload-session-repository.port'
import type {
  FileAuthorizationPort,
  FileActor,
} from '../../ports/file-authorization.port'
import type { FileRepository } from '../../ports/repositories/file-repository.port'
import { FILE_AUTHORIZATION } from '@/modules/file/application/ports/file-authorization.port'
import { FILE_PROCESSING_DISPATCH } from '@/modules/file/application/ports/file-processing-dispatch.port'
import { retryRepositoryConflict } from '../../services/repository-conflict-retry'

/** Confirms uploaded bytes exist but does not trust content type or mark the file ready. */
@Injectable()
export class CompleteUpload {
  constructor(
    @Inject(UPLOAD_SESSION_REPOSITORY)
    private readonly uploads: UploadSessionRepository,
    @Inject(FILE_REPOSITORY) private readonly files: FileRepository,
    @Inject(FILE_AUTHORIZATION)
    private readonly authorization: FileAuthorizationPort,
    @Inject(FILE_UNIT_OF_WORK) private readonly unitOfWork: FileUnitOfWork,
    @Inject(OBJECT_STORAGE) private readonly storage: ObjectStoragePort,
    @Inject(FILE_PROCESSING_DISPATCH)
    private readonly dispatch: FileProcessingDispatchPort
  ) {}

  async execute(input: {
    sessionId: string
    actor: FileActor
  }): Promise<{ fileId: string; status: 'processing' }> {
    const id = UploadSessionId.create(input.sessionId)
    const snapshot = await this.uploads.findById(id)
    if (!snapshot || snapshot.entity.initiatedBy.value !== input.actor.userId) {
      throw new FileApplicationError(
        FileApplicationErrorCode.NOT_FOUND,
        'Upload session not found'
      )
    }
    const session = snapshot.entity
    const fileSnapshot = await this.files.findById(session.fileId)
    if (!fileSnapshot)
      throw new FileApplicationError(
        FileApplicationErrorCode.NOT_FOUND,
        'File not found'
      )
    if (
      fileSnapshot.entity.scope.type === FileScopeType.WORKSPACE &&
      fileSnapshot.entity.scope.id !== input.actor.workspaceId
    ) {
      throw new FileApplicationError(
        FileApplicationErrorCode.NOT_FOUND,
        'Upload session not found'
      )
    }
    await this.authorization.assertCanCompleteUpload({
      actor: input.actor,
      file: fileSnapshot.entity,
    })
    if (
      session.status !== UploadSessionStatus.INITIATED &&
      session.status !== UploadSessionStatus.COMPLETED
    ) {
      throw new FileApplicationError(
        FileApplicationErrorCode.CONFLICT,
        'Upload is no longer active'
      )
    }
    if (
      session.status === UploadSessionStatus.INITIATED &&
      new Date() >= session.expiresAt
    ) {
      throw new FileApplicationError(
        FileApplicationErrorCode.EXPIRED_UPLOAD,
        'Upload session expired'
      )
    }
    if (session.status === UploadSessionStatus.COMPLETED) {
      await this.dispatch.enqueueVerify(session.fileId.value)
      return { fileId: session.fileId.value, status: 'processing' }
    }
    const stored = await this.storage.inspect(session.stagingObject)
    if (
      !stored ||
      stored.sizeBytes !== session.expectedSize.bytes ||
      !stored.etag
    ) {
      throw new FileApplicationError(
        FileApplicationErrorCode.CONFLICT,
        'Uploaded object is missing or has an incorrect size'
      )
    }
    await retryRepositoryConflict(() =>
      this.unitOfWork.execute(async (repos) => {
        const latestSession = await repos.uploads.findById(id)
        if (!latestSession)
          throw new FileApplicationError(
            FileApplicationErrorCode.NOT_FOUND,
            'Upload session not found'
          )
        if (latestSession.entity.status === UploadSessionStatus.COMPLETED)
          return
        const latestFile = await repos.files.findById(
          FileId.create(session.fileId.value)
        )
        if (
          !latestFile ||
          latestFile.entity.status !== FileStatus.PENDING_UPLOAD
        ) {
          throw new FileApplicationError(
            FileApplicationErrorCode.CONFLICT,
            'File cannot complete an upload in this state'
          )
        }
        latestSession.entity.complete()
        await repos.uploads.update(latestSession.entity, latestSession.revision)
      })
    )
    // Idempotent enqueue on retries. A periodic reconciler should also redrive missed dispatches.
    await this.dispatch.enqueueVerify(session.fileId.value)
    return { fileId: session.fileId.value, status: 'processing' }
  }
}
