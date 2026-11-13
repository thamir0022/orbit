import { Inject, Injectable } from '@nestjs/common'
import {
  FileChecksum,
  FileId,
  FileMimeType,
  FileSize,
  FileStatus,
  UploadSessionStatus,
  StorageObjectRef,
} from '@/modules/file/domain'
import {
  FileApplicationError,
  FileApplicationErrorCode,
} from '../../errors/file-application.error'
import {
  FileContentRejectedError,
  type FileContentInspectorPort,
} from '../../ports/file-content-inspector.port'
import type { FileSecurityScannerPort } from '../../ports/file-security-scanner.port'
import type { FileRepository } from '../../ports/repositories/file-repository.port'
import type { FileUnitOfWork } from '../../ports/repositories/file-unit-of-work.port'
import type { UploadSessionRepository } from '../../ports/repositories/upload-session-repository.port'
import type { ObjectStoragePort } from '../../ports/object-storage.port'
import { FILE_REPOSITORY } from '@/modules/file/application/ports/repositories/file-repository.port'
import { FILE_UNIT_OF_WORK } from '@/modules/file/application/ports/repositories/file-unit-of-work.port'
import { OBJECT_STORAGE } from '@/modules/file/application/ports/object-storage.port'
import { UPLOAD_SESSION_REPOSITORY } from '@/modules/file/application/ports/repositories/upload-session-repository.port'
import { FILE_SECURITY_SCANNER } from '@/modules/file/application/ports/file-security-scanner.port'
import { FILE_CONTENT_INSPECTOR } from '@/modules/file/application/ports/file-content-inspector.port'
import { retryRepositoryConflict } from '../../services/repository-conflict-retry'
import { PromoteFile } from '../promote-file/promote-file.use-case'

/** Internal worker use case: validate, hash, scan, persist verified state, then conditionally promote. */
@Injectable()
export class VerifyAndScanFile {
  constructor(
    @Inject(FILE_REPOSITORY) private readonly files: FileRepository,
    @Inject(UPLOAD_SESSION_REPOSITORY)
    private readonly uploads: UploadSessionRepository,
    @Inject(FILE_UNIT_OF_WORK) private readonly unitOfWork: FileUnitOfWork,
    @Inject(OBJECT_STORAGE) private readonly storage: ObjectStoragePort,
    @Inject(FILE_CONTENT_INSPECTOR)
    private readonly inspector: FileContentInspectorPort,
    @Inject(FILE_SECURITY_SCANNER)
    private readonly scanner: FileSecurityScannerPort,
    private readonly promote: PromoteFile
  ) {}

  async execute(fileId: string): Promise<void> {
    const id = FileId.create(fileId)
    const record = await this.files.findById(id)
    if (!record)
      throw new FileApplicationError(
        FileApplicationErrorCode.NOT_FOUND,
        'File not found'
      )
    const file = record.entity
    if (
      [
        FileStatus.READY,
        FileStatus.REJECTED,
        FileStatus.FAILED,
        FileStatus.DELETED,
      ].includes(file.status)
    )
      return
    if (
      file.status !== FileStatus.PENDING_UPLOAD &&
      file.status !== FileStatus.PROCESSING
    ) {
      throw new FileApplicationError(
        FileApplicationErrorCode.CONFLICT,
        'File has not been queued for verification'
      )
    }
    const sessionRecord = await this.uploads.findByFileId(id)
    if (
      !sessionRecord ||
      sessionRecord.entity.status !== UploadSessionStatus.COMPLETED
    ) {
      throw new FileApplicationError(
        FileApplicationErrorCode.CONFLICT,
        'Upload has not completed'
      )
    }
    const staging = sessionRecord.entity.stagingObject
    const before = await this.storage.inspect(staging)
    if (
      !before ||
      before.sizeBytes !== file.expectedSize.bytes ||
      !before.etag
    ) {
      await this.rejectAndRelease(
        id,
        'Staging object does not match the declared size'
      )
      return
    }
    // Read a version-pinned object where supported; ETag checks remain mandatory for non-versioned stores.
    const snapshotObject = before.versionId
      ? StorageObjectRef.create({
          locationId: staging.locationId,
          key: staging.key,
          versionId: before.versionId,
        })
      : staging

    let verified: Awaited<ReturnType<FileContentInspectorPort['inspect']>>
    try {
      verified = await this.inspector.inspect({
        object: snapshotObject,
        expectedEtag: before.etag,
        expectedBytes: file.expectedSize.bytes,
        declaredMimeType: file.declaredMimeType.value,
      })
    } catch (error: unknown) {
      if (!(error instanceof FileContentRejectedError)) throw error
      await this.rejectAndRelease(id, 'File content failed validation')
      return
    }
    // Never turn scanner outages into CLEAN or REJECTED; fail the worker for retry.
    const scan = await this.scanner.scan(snapshotObject, before.etag)
    const after = await this.storage.inspect(staging)
    if (
      !after ||
      after.etag !== before.etag ||
      after.versionId !== before.versionId ||
      after.sizeBytes !== before.sizeBytes
    ) {
      throw new FileApplicationError(
        FileApplicationErrorCode.CONFLICT,
        'Upload object changed during verification'
      )
    }
    if (!scan.clean) {
      await this.rejectAndRelease(id, 'File rejected by malware scanner', true)
      return
    }
    if (
      file.status === FileStatus.PROCESSING &&
      file.checksum?.sha256 !== verified.sha256
    ) {
      await this.rejectAndRelease(
        id,
        'Uploaded content changed after its previous verification'
      )
      return
    }
    await retryRepositoryConflict(() =>
      this.unitOfWork.execute(async (repos) => {
        const latest = await repos.files.findById(id)
        if (!latest)
          throw new FileApplicationError(
            FileApplicationErrorCode.NOT_FOUND,
            'File not found'
          )
        if (latest.entity.status === FileStatus.PENDING_UPLOAD) {
          latest.entity.confirmUpload({
            size: FileSize.create(verified.sizeBytes),
            mimeType: FileMimeType.create(verified.mimeType),
            mediaType: verified.mediaType,
            checksum: FileChecksum.create(verified.sha256),
          })
          latest.entity.beginProcessing()
          latest.entity.markScanClean()
          await repos.files.update(latest.entity, latest.revision)
        } else if (
          latest.entity.status !== FileStatus.PROCESSING ||
          latest.entity.checksum?.sha256 !== verified.sha256
        ) {
          throw new FileApplicationError(
            FileApplicationErrorCode.CONFLICT,
            'File state or checksum changed while scanning'
          )
        }
      })
    )
    await this.promote.execute({
      fileId: id.value,
      sourceEtag: before.etag,
      sha256: verified.sha256,
      stagingObject: snapshotObject,
    })
  }

  /** Reject and release exactly once under a transaction; cleanup is delegated to retention policies. */
  private async rejectAndRelease(
    id: FileId,
    reason: string,
    infected = false
  ): Promise<void> {
    await retryRepositoryConflict(() =>
      this.unitOfWork.execute(async (repos) => {
        const snapshot = await repos.files.findById(id)
        if (
          !snapshot ||
          ![
            FileStatus.PENDING_UPLOAD,
            FileStatus.UPLOADED,
            FileStatus.PROCESSING,
          ].includes(snapshot.entity.status)
        )
          return
        const usage = await repos.usage.findByScope(snapshot.entity.scope)
        if (!usage)
          throw new FileApplicationError(
            FileApplicationErrorCode.CONFLICT,
            'Storage reservation not found'
          )
        usage.entity.releaseReservation(snapshot.entity.expectedSize)
        snapshot.entity.reject(reason, infected)
        await repos.usage.update(usage.entity, usage.revision)
        await repos.files.update(snapshot.entity, snapshot.revision)
      })
    )
  }
}
