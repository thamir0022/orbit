import { FileId, UploadSession, UploadSessionId } from '@/modules/file/domain'
import { RepositorySnapshot } from './repository-snapshot'

/** Persistence operations for temporary uploads and expiry cleanup. */
export interface UploadSessionRepository {
  findById(
    id: UploadSessionId
  ): Promise<RepositorySnapshot<UploadSession> | null>
  findByFileId(
    fileId: FileId
  ): Promise<RepositorySnapshot<UploadSession> | null>
  findExpired(
    before: Date,
    limit: number
  ): Promise<ReadonlyArray<RepositorySnapshot<UploadSession>>>
  insert(session: UploadSession): Promise<void>
  update(session: UploadSession, expectedRevision: number): Promise<number>
}

export const UPLOAD_SESSION_REPOSITORY = Symbol('IUploadSessionRepository')
