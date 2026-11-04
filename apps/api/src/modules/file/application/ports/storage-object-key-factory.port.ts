import type { FileId, FileScope, StorageObjectRef } from '@/modules/file/domain'

/** Supplies unguessable staging and final object names. */
export interface StorageObjectKeyFactoryPort {
  staging(scope: FileScope, fileId: FileId): StorageObjectRef
  permanent(scope: FileScope, fileId: FileId): StorageObjectRef
}

export const STORAGE_OBJECT_KEY_FACTORY = Symbol('IStorageObjectKeyFactory')
