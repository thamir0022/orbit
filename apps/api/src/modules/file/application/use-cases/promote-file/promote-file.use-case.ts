import { Inject, Injectable } from '@nestjs/common'
import {
  FileId,
  FileScanStatus,
  FileSize,
  FileStatus,
  type StorageObjectRef,
} from '@/modules/file/domain'
import {
  FileApplicationError,
  FileApplicationErrorCode,
} from '../../errors/file-application.error'
import {
  FILE_REPOSITORY,
  type FileRepository,
} from '../../ports/repositories/file-repository.port'
import {
  FILE_UNIT_OF_WORK,
  type FileUnitOfWork,
} from '../../ports/repositories/file-unit-of-work.port'
import {
  OBJECT_STORAGE,
  type ObjectStoragePort,
} from '../../ports/object-storage.port'
import {
  STORAGE_OBJECT_KEY_FACTORY,
  type StorageObjectKeyFactoryPort,
} from '../../ports/storage-object-key-factory.port'
import { retryRepositoryConflict } from '../../services/repository-conflict-retry'

/** Promotes a verified, malware-scanned file to permanent storage. */
@Injectable()
export class PromoteFile {
  constructor(
    @Inject(FILE_REPOSITORY)
    private readonly files: FileRepository,

    @Inject(FILE_UNIT_OF_WORK)
    private readonly unitOfWork: FileUnitOfWork,

    @Inject(OBJECT_STORAGE)
    private readonly storage: ObjectStoragePort,

    @Inject(STORAGE_OBJECT_KEY_FACTORY)
    private readonly keys: StorageObjectKeyFactoryPort
  ) {}

  async execute(input: {
    fileId: string
    sourceEtag: string
    sha256: string
    stagingObject: StorageObjectRef
  }): Promise<void> {
    const id = FileId.create(input.fileId)
    const current = await this.files.findById(id)

    if (!current) {
      throw new FileApplicationError(
        FileApplicationErrorCode.NOT_FOUND,
        'File not found'
      )
    }

    const file = current.entity

    if (file.status === FileStatus.READY) return

    if (
      file.status !== FileStatus.PROCESSING ||
      file.scanStatus !== FileScanStatus.CLEAN ||
      file.checksum?.sha256 !== input.sha256 ||
      !file.mimeType ||
      !file.size
    ) {
      throw new FileApplicationError(
        FileApplicationErrorCode.CONFLICT,
        'Only verified and clean processing files may be promoted'
      )
    }

    const original = await this.storage.inspect(input.stagingObject)

    if (
      !original ||
      original.etag !== input.sourceEtag ||
      original.sizeBytes !== file.size.bytes
    ) {
      throw new FileApplicationError(
        FileApplicationErrorCode.CONFLICT,
        'Staging object changed after verification'
      )
    }

    const destination = this.keys.permanent(file.scope, file.id)

    const promoted = await this.storage.promote({
      source: input.stagingObject,
      destination,
      sourceEtag: input.sourceEtag,
      contentType: file.mimeType.value,
      sha256: input.sha256,
      sizeBytes: file.size.bytes,
    })

    const remote = await this.storage.inspect(promoted)

    if (
      !remote ||
      remote.sizeBytes !== file.size.bytes ||
      remote.sha256 !== input.sha256
    ) {
      throw new FileApplicationError(
        FileApplicationErrorCode.FILE_UNAVAILABLE,
        'Promoted object verification failed'
      )
    }

    await retryRepositoryConflict(() =>
      this.unitOfWork.execute(async (repos) => {
        const latest = await repos.files.findById(id)

        if (
          !latest ||
          latest.entity.status !== FileStatus.PROCESSING ||
          latest.entity.scanStatus !== FileScanStatus.CLEAN ||
          latest.entity.checksum?.sha256 !== input.sha256
        ) {
          throw new FileApplicationError(
            FileApplicationErrorCode.CONFLICT,
            'File state changed during promotion'
          )
        }

        const usageSnapshot = await repos.usage.findByScope(latest.entity.scope)

        if (!usageSnapshot || !latest.entity.size) {
          throw new FileApplicationError(
            FileApplicationErrorCode.CONFLICT,
            'Missing file storage reservation'
          )
        }

        usageSnapshot.entity.commitReservation(
          latest.entity.expectedSize,
          FileSize.create(remote.sizeBytes)
        )

        latest.entity.markReady(promoted)

        await repos.usage.update(usageSnapshot.entity, usageSnapshot.revision)

        await repos.files.update(latest.entity, latest.revision)
      })
    )

    // Keep staging until lifecycle cleanup for safe concurrent verification.
  }
}
