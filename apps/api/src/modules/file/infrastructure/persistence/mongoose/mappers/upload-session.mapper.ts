import { UserId } from '@/modules/user/domain'
import {
  FileId,
  FileSize,
  StorageObjectRef,
  UploadSession,
  UploadSessionId,
} from '@/modules/file/domain'
import { UploadSessionMongoModel } from '../schemas/upload-session.schema'
import { readUuid } from '../utils/mongo-mapping.utils'

/** Maps upload sessions to and from MongoDB. */
export class UploadSessionMapper {
  static toDomain(doc: UploadSessionMongoModel): UploadSession {
    return UploadSession.reconstitute({
      id: UploadSessionId.create(readUuid(doc.id, 'uploadSession.id')),
      fileId: FileId.create(readUuid(doc.fileId, 'uploadSession.fileId')),
      initiatedBy: UserId.create(
        readUuid(doc.initiatedBy, 'uploadSession.initiatedBy')
      ),
      stagingObject: StorageObjectRef.create(doc.stagingObject),
      expectedSize: FileSize.create(doc.expectedSizeBytes),
      status: doc.status,
      createdAt: doc.createdAt,
      expiresAt: doc.expiresAt,
      completedAt: doc.completedAt,
      abortedAt: doc.abortedAt,
    })
  }

  static toPersistence(
    session: UploadSession
  ): Omit<UploadSessionMongoModel, 'revision'> {
    return {
      id: session.id.value,
      fileId: session.fileId.value,
      initiatedBy: session.initiatedBy.value,
      stagingObject: {
        locationId: session.stagingObject.locationId,
        key: session.stagingObject.key,
        versionId: session.stagingObject.versionId,
      },
      expectedSizeBytes: session.expectedSize.bytes,
      status: session.status,
      createdAt: session.createdAt,
      expiresAt: session.expiresAt,
      completedAt: session.completedAt,
      abortedAt: session.abortedAt,
    }
  }
}
