import { Inject, Injectable } from '@nestjs/common'
import { FileStatus, UploadSessionStatus } from '@/modules/file/domain'
import type { FileUnitOfWork } from '../ports/repositories/file-unit-of-work.port'
import type { UploadSessionRepository } from '../ports/repositories/upload-session-repository.port'
import type { ObjectStoragePort } from '../ports/object-storage.port'
import { FILE_UNIT_OF_WORK } from '@/modules/file/application/ports/repositories/file-unit-of-work.port'
import { OBJECT_STORAGE } from '@/modules/file/application/ports/object-storage.port'
import { UPLOAD_SESSION_REPOSITORY } from '@/modules/file/application/ports/repositories/upload-session-repository.port'
import { retryRepositoryConflict } from './repository-conflict-retry'

/** Releases reservations from abandoned upload grants and marks expired sessions atomically. */
@Injectable()
export class ExpiredUploadCleanup {
  constructor(
    @Inject(UPLOAD_SESSION_REPOSITORY)
    private readonly uploads: UploadSessionRepository,
    @Inject(FILE_UNIT_OF_WORK) private readonly unitOfWork: FileUnitOfWork,
    @Inject(OBJECT_STORAGE) private readonly storage: ObjectStoragePort
  ) {}

  async execute(limit = 100): Promise<number> {
    const now = new Date()
    const expired = await this.uploads.findExpired(now, limit)
    let cleaned = 0
    for (const snapshot of expired) {
      const session = snapshot.entity
      const didExpire = await retryRepositoryConflict(() =>
        this.unitOfWork.execute(async (repos) => {
          const latestSession = await repos.uploads.findById(session.id)
          if (
            !latestSession ||
            latestSession.entity.status !== UploadSessionStatus.INITIATED ||
            latestSession.entity.expiresAt > now
          )
            return false
          const file = await repos.files.findById(latestSession.entity.fileId)
          if (!file) throw new Error('Expired upload references a missing file')
          const usage = await repos.usage.findByScope(file.entity.scope)
          if (!usage)
            throw new Error('Expired upload has no matching quota reservation')
          if (file.entity.status === FileStatus.PENDING_UPLOAD) {
            file.entity.reject('Upload session expired')
            usage.entity.releaseReservation(latestSession.entity.expectedSize)
            await repos.files.update(file.entity, file.revision)
            await repos.usage.update(usage.entity, usage.revision)
          }
          latestSession.entity.expire(now)
          await repos.uploads.update(
            latestSession.entity,
            latestSession.revision
          )
          return true
        })
      )
      // A completion may win after findExpired. Never delete its staging bytes.
      if (!didExpire) continue
      cleaned += 1
      // Garbage collection is best-effort; S3 lifecycle must also expire staging objects.
      await this.storage.delete(session.stagingObject).catch(() => undefined)
    }
    return cleaned
  }
}
