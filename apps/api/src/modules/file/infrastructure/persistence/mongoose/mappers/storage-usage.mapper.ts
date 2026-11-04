import { FileScope, StorageUsage, StorageUsageId } from '@/modules/file/domain'
import { StorageUsageMongoModel } from '../schemas/storage-usage.schema'
import { readUuid } from '../utils/mongo-mapping.utils'

/** Persistence mapper for optimistic-concurrency storage quota counters. */
export class StorageUsageMapper {
  static toDomain(doc: StorageUsageMongoModel): StorageUsage {
    return StorageUsage.reconstitute({
      id: StorageUsageId.create(readUuid(doc.id, 'storageUsage.id')),
      scope: FileScope.create(
        doc.scope.type,
        readUuid(doc.scope.id, 'storageUsage.scope.id')
      ),
      usedBytes: doc.usedBytes,
      reservedBytes: doc.reservedBytes,
      updatedAt: doc.updatedAt,
    })
  }

  static toPersistence(
    usage: StorageUsage
  ): Omit<StorageUsageMongoModel, 'revision'> {
    return {
      id: usage.id.value,
      scope: { type: usage.scope.type, id: usage.scope.id },
      usedBytes: usage.usedBytes,
      reservedBytes: usage.reservedBytes,
      updatedAt: usage.updatedAt,
    }
  }
}
