import { Inject, Injectable, Logger } from '@nestjs/common'
import { FileStatus } from '@/modules/file/domain'
import {
  FILE_REPOSITORY,
  type FileRepository,
} from '../ports/repositories/file-repository.port'
import {
  ATTACHMENT_REPOSITORY,
  type AttachmentRepository,
} from '../ports/repositories/attachment-repository.port'
import {
  FILE_UNIT_OF_WORK,
  type FileUnitOfWork,
} from '../ports/repositories/file-unit-of-work.port'
import {
  OBJECT_STORAGE,
  type ObjectStoragePort,
} from '../ports/object-storage.port'
import { retryRepositoryConflict } from './repository-conflict-retry'

export const DELETED_FILE_RETENTION_MS = 30 * 24 * 60 * 60 * 1000

/** Retains tombstones; releases quota only after the provider confirms byte deletion. */
@Injectable()
export class DeletedFileCleanup {
  private readonly logger = new Logger(DeletedFileCleanup.name)

  constructor(
    @Inject(FILE_REPOSITORY) private readonly files: FileRepository,
    @Inject(ATTACHMENT_REPOSITORY)
    private readonly attachments: AttachmentRepository,
    @Inject(FILE_UNIT_OF_WORK) private readonly work: FileUnitOfWork,
    @Inject(OBJECT_STORAGE) private readonly storage: ObjectStoragePort
  ) {}

  async execute(limit = 25): Promise<number> {
    const cutoff = new Date(Date.now() - DELETED_FILE_RETENTION_MS)
    const candidates = await this.files.findDeletedBefore(cutoff, limit)
    let purged = 0
    for (const { entity: file, revision } of candidates) {
      try {
        if (
          file.status !== FileStatus.DELETED ||
          !file.deletedAt ||
          file.deletedAt > cutoff ||
          file.purgedAt ||
          !file.storageObject ||
          !file.size
        )
          continue
        // Rotate failed/held objects behind unattempted work instead of starving the backlog.
        file.recordPurgeAttempt()
        await this.files.update(file, revision)
        if (await this.attachments.hasActiveReferences(file.id)) continue
        // Deleted files cannot accept new links. Provider deletion must be idempotent.
        await this.storage.delete(file.storageObject, { permanent: true })
        const changed = await retryRepositoryConflict(() =>
          this.work.execute(async (repos) => {
            const current = await repos.files.findById(file.id)
            if (!current || current.entity.purgedAt) return false
            if (
              current.entity.status !== FileStatus.DELETED ||
              !current.entity.size
            )
              throw new Error('Invalid file disposal state')
            const usage = await repos.usage.findByScope(current.entity.scope)
            if (!usage)
              throw new Error('File disposal has no storage usage record')
            usage.entity.releaseUsed(current.entity.size)
            current.entity.markPurged()
            await repos.usage.update(usage.entity, usage.revision)
            await repos.files.update(current.entity, current.revision)
            return true
          })
        )
        if (changed) purged += 1
      } catch (error: unknown) {
        // A later reconciliation retries provider/DB failures without exposing storage credentials.
        this.logger.error({
          message: 'File disposal failed',
          fileId: file.id.value,
          errorType: error instanceof Error ? error.name : 'UnknownError',
        })
      }
    }
    return purged
  }
}
