import { Injectable } from '@nestjs/common'
import { InjectConnection } from '@nestjs/mongoose'
import type { ClientSession, Connection } from 'mongoose'
import {
  FileRepositorySet,
  FileUnitOfWork,
} from '@/modules/file/application/ports/repositories/file-unit-of-work.port'
import { MongoAttachmentRepository } from './repositories/mongo-attachment.repository'
import { MongoFileRepository } from './repositories/mongo-file.repository'
import { MongoStorageUsageRepository } from './repositories/mongo-storage-usage.repository'
import { MongoUploadSessionRepository } from './repositories/mongo-upload-session.repository'

/** Runs related aggregate writes in one MongoDB transaction. */
@Injectable()
export class MongoFileUnitOfWork implements FileUnitOfWork {
  constructor(
    @InjectConnection() private readonly connection: Connection,
    private readonly files: MongoFileRepository,
    private readonly attachments: MongoAttachmentRepository,
    private readonly uploads: MongoUploadSessionRepository,
    private readonly usage: MongoStorageUsageRepository
  ) {}

  execute<T>(
    work: (repositories: FileRepositorySet) => Promise<T>
  ): Promise<T> {
    return this.connection.transaction(async (session: ClientSession) => {
      const repositories: FileRepositorySet = {
        files: this.files.withSession(session),
        attachments: this.attachments.withSession(session),
        uploads: this.uploads.withSession(session),
        usage: this.usage.withSession(session),
      }
      return work(repositories)
    })
  }
}
