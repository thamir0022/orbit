import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import type { Model } from 'mongoose'
import { FileStatus, UploadSessionStatus } from '@/modules/file/domain'
import { readUuid } from '@/modules/file/infrastructure/persistence/mongoose/utils/mongo-mapping.utils'
import { FileMongoModel } from '@/modules/file/infrastructure/persistence/mongoose/schemas/file.schema'
import { UploadSessionMongoModel } from '@/modules/file/infrastructure/persistence/mongoose/schemas/upload-session.schema'

/** Repairs interrupted queue dispatches by finding completed uploads still awaiting processing. */
@Injectable()
export class FileProcessingRecoveryQuery {
  constructor(
    @InjectModel(FileMongoModel.name)
    private readonly files: Model<FileMongoModel>,
    @InjectModel(UploadSessionMongoModel.name)
    private readonly uploads: Model<UploadSessionMongoModel>
  ) {}

  async findPending(limit = 100): Promise<readonly string[]> {
    const fileIds: string[] = []
    let cursor: unknown = null
    // Pages over all pending files so stale, uncompleted uploads cannot starve completed ones.
    for (let page = 0; page < 100 && fileIds.length < limit; page += 1) {
      const query: Record<string, unknown> = {
        status: { $in: [FileStatus.PENDING_UPLOAD, FileStatus.PROCESSING] },
      }
      if (cursor) query._id = { $gt: cursor }
      const candidates = await this.files
        .find(query)
        .select({ id: 1, _id: 1 })
        .sort({ _id: 1 })
        .limit(200)
        .exec()
      if (candidates.length === 0) break
      cursor = candidates[candidates.length - 1]._id
      const ids = candidates.map((record: FileMongoModel) =>
        readUuid(record.id, 'file.id')
      )
      const ready = await this.uploads
        .find({
          fileId: { $in: ids },
          status: UploadSessionStatus.COMPLETED,
        })
        .select({ fileId: 1 })
        .exec()
      for (const session of ready) {
        fileIds.push(readUuid(session.fileId, 'uploadSession.fileId'))
        if (fileIds.length >= limit) break
      }
      if (candidates.length < 200) break
    }
    return fileIds
  }
}
