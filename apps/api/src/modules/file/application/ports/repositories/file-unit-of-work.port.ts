import { AttachmentRepository } from './attachment-repository.port'
import { FileRepository } from './file-repository.port'
import { StorageUsageRepository } from './storage-usage-repository.port'
import { UploadSessionRepository } from './upload-session-repository.port'

/** Repositories share one transaction within a unit of work. */
export interface FileRepositorySet {
  readonly files: FileRepository
  readonly attachments: AttachmentRepository
  readonly uploads: UploadSessionRepository
  readonly usage: StorageUsageRepository
}

/** Transaction lifecycle abstraction; callers must not perform network I/O in callback. */
export interface FileUnitOfWork {
  execute<T>(work: (repositories: FileRepositorySet) => Promise<T>): Promise<T>
}

export const FILE_UNIT_OF_WORK = Symbol('IFileUnitOfWork')
