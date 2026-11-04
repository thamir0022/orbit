import { UserId } from '@/modules/user/domain'
import {
  File,
  FileChecksum,
  FileId,
  FileMediaInfo,
  FileMimeType,
  FileScope,
  FileSize,
  StorageObjectRef,
} from '@/modules/file/domain'
import { FileMongoModel } from '../schemas/file.schema'
import { readUuid } from '../utils/mongo-mapping.utils'

/** Maps File aggregates to and from MongoDB. */
export class FileMapper {
  static toDomain(doc: FileMongoModel): File {
    return File.reconstitute({
      id: FileId.create(readUuid(doc.id, 'file.id')),
      scope: FileScope.create(
        doc.scope.type,
        readUuid(doc.scope.id, 'file.scope.id')
      ),
      createdBy: UserId.create(readUuid(doc.createdBy, 'file.createdBy')),
      originalName: doc.originalName,
      declaredMimeType: FileMimeType.create(doc.declaredMimeType),
      expectedSize: FileSize.create(doc.expectedSizeBytes),
      mimeType: doc.mimeType ? FileMimeType.create(doc.mimeType) : null,
      mediaType: doc.mediaType,
      size: doc.sizeBytes === null ? null : FileSize.create(doc.sizeBytes),
      checksum: doc.checksumSha256
        ? FileChecksum.create(doc.checksumSha256)
        : null,
      mediaInfo: doc.mediaInfo ? FileMediaInfo.create(doc.mediaInfo) : null,
      storageObject: doc.storageObject
        ? StorageObjectRef.create(doc.storageObject)
        : null,
      status: doc.status,
      scanStatus: doc.scanStatus,
      failureReason: doc.failureReason,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
      uploadedAt: doc.uploadedAt,
      readyAt: doc.readyAt,
      deletedAt: doc.deletedAt,
    })
  }

  /** Creates a persistence snapshot without revision metadata. */
  static toPersistence(file: File): Omit<FileMongoModel, 'revision'> {
    return {
      id: file.id.value,
      scope: {
        type: file.scope.type,
        id: file.scope.id,
      },
      createdBy: file.createdBy.value,
      originalName: file.originalName,
      declaredMimeType: file.declaredMimeType.value,
      expectedSizeBytes: file.expectedSize.bytes,
      mimeType: file.mimeType?.value ?? null,
      mediaType: file.mediaType,
      sizeBytes: file.size?.bytes ?? null,
      checksumSha256: file.checksum?.sha256 ?? null,
      mediaInfo: file.mediaInfo
        ? {
            width: file.mediaInfo.width,
            height: file.mediaInfo.height,
            durationMs: file.mediaInfo.durationMs,
          }
        : null,
      storageObject: file.storageObject
        ? {
            locationId: file.storageObject.locationId,
            key: file.storageObject.key,
            versionId: file.storageObject.versionId,
          }
        : null,
      status: file.status,
      scanStatus: file.scanStatus,
      failureReason: file.failureReason,
      createdAt: file.createdAt,
      updatedAt: file.updatedAt,
      uploadedAt: file.uploadedAt,
      readyAt: file.readyAt,
      deletedAt: file.deletedAt,
    }
  }
}
