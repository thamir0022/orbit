import { File, FileId } from '@/modules/file/domain'
import { RepositorySnapshot } from './repository-snapshot'

/** Persistence contract for logical file aggregates. */
export interface FileRepository {
  findById(id: FileId): Promise<RepositorySnapshot<File> | null>
  insert(file: File): Promise<void>
  update(file: File, expectedRevision: number): Promise<number>
}

export const FILE_REPOSITORY = Symbol('IFileRepository')
