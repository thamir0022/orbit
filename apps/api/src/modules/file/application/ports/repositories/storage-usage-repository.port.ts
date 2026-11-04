import { FileScope, StorageUsage } from '@/modules/file/domain'
import { RepositorySnapshot } from './repository-snapshot'

/** Account/workspace quota storage; use with a transaction and CAS revision. */
export interface StorageUsageRepository {
  findByScope(
    scope: FileScope
  ): Promise<RepositorySnapshot<StorageUsage> | null>
  insert(usage: StorageUsage): Promise<void>
  update(usage: StorageUsage, expectedRevision: number): Promise<number>
}

export const STORAGE_USAGE_REPOSITORY = Symbol('IStorageUsageRepository')
