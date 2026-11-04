import { UserId } from '@/modules/user/domain'
import { WorkspaceId } from '@/modules/workspace/domain'
import {
  Attachment,
  AttachmentId,
  AttachmentTarget,
  FileId,
} from '@/modules/file/domain'
import { AttachmentMongoModel } from '../schemas/attachment.schema'
import { readUuid } from '../utils/mongo-mapping.utils'

/** Maps attachment aggregates to and from MongoDB. */
export class AttachmentMapper {
  static toDomain(doc: AttachmentMongoModel): Attachment {
    return Attachment.reconstitute({
      id: AttachmentId.create(readUuid(doc.id, 'attachment.id')),
      workspaceId: WorkspaceId.create(
        readUuid(doc.workspaceId, 'attachment.workspaceId')
      ),
      fileId: FileId.create(readUuid(doc.fileId, 'attachment.fileId')),
      target: AttachmentTarget.create(
        doc.target.type,
        readUuid(doc.target.id, 'attachment.target.id')
      ),
      placement: doc.placement,
      displayName: doc.displayName,
      position: doc.position,
      createdBy: UserId.create(readUuid(doc.createdBy, 'attachment.createdBy')),
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
      deletedAt: doc.deletedAt,
    })
  }

  static toPersistence(
    attachment: Attachment
  ): Omit<AttachmentMongoModel, 'revision'> {
    return {
      id: attachment.id.value,
      workspaceId: attachment.workspaceId.value,
      fileId: attachment.fileId.value,
      target: {
        type: attachment.target.type,
        id: attachment.target.id,
      },
      placement: attachment.placement,
      displayName: attachment.displayName,
      position: attachment.position,
      createdBy: attachment.createdBy.value,
      createdAt: attachment.createdAt,
      updatedAt: attachment.updatedAt,
      deletedAt: attachment.deletedAt,
    }
  }
}
