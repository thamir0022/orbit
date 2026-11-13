import { Injectable, Optional } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import type { ClientSession, HydratedDocument, Model } from 'mongoose'
import {
  FileId,
  UploadSession,
  UploadSessionId,
  UploadSessionStatus,
} from '@/modules/file/domain'
import type { UploadSessionRepository } from '@/modules/file/application/ports/repositories/upload-session-repository.port'
import type { RepositorySnapshot } from '@/modules/file/application/ports/repositories/repository-snapshot'
import { UploadSessionMapper } from '../mappers/upload-session.mapper'
import { UploadSessionMongoModel } from '../schemas/upload-session.schema'
import {
  assertUpdated,
  boundedLimit,
  mapWriteError,
  requireRevision,
} from '../utils/mongo-mapping.utils'

/** Mongoose repository for upload session aggregates. */
@Injectable()
export class MongoUploadSessionRepository implements UploadSessionRepository {
  constructor(
    @InjectModel(UploadSessionMongoModel.name)
    private readonly model: Model<UploadSessionMongoModel>,

    @Optional()
    private readonly session: ClientSession | null = null
  ) {}

  /** Creates a repository bound to an existing MongoDB transaction. */
  withSession(session: ClientSession): MongoUploadSessionRepository {
    return new MongoUploadSessionRepository(this.model, session)
  }

  private snapshot(
    doc: HydratedDocument<UploadSessionMongoModel>
  ): RepositorySnapshot<UploadSession> {
    return {
      entity: UploadSessionMapper.toDomain(doc),
      revision: requireRevision(doc.revision),
    }
  }

  async findById(
    id: UploadSessionId
  ): Promise<RepositorySnapshot<UploadSession> | null> {
    const doc = await this.model
      .findOne({ id: id.value })
      .session(this.session)
      .exec()

    return doc ? this.snapshot(doc) : null
  }

  async findByFileId(
    fileId: FileId
  ): Promise<RepositorySnapshot<UploadSession> | null> {
    const doc = await this.model
      .findOne({ fileId: fileId.value })
      .session(this.session)
      .exec()

    return doc ? this.snapshot(doc) : null
  }

  async findExpired(
    before: Date,
    limit: number
  ): Promise<ReadonlyArray<RepositorySnapshot<UploadSession>>> {
    const records = await this.model
      .find({
        status: UploadSessionStatus.INITIATED,
        expiresAt: { $lte: before },
      })
      .sort({
        expiresAt: 1,
        _id: 1,
      })
      .limit(boundedLimit(limit))
      .session(this.session)
      .exec()

    return records.map((doc) => this.snapshot(doc))
  }

  async insert(entity: UploadSession): Promise<void> {
    try {
      await new this.model({
        ...UploadSessionMapper.toPersistence(entity),
        revision: 0,
      }).save({
        session: this.session ?? undefined,
      })
    } catch (error: unknown) {
      mapWriteError(error)
    }
  }

  async update(
    entity: UploadSession,
    expectedRevision: number
  ): Promise<number> {
    requireRevision(expectedRevision)

    const changes = UploadSessionMapper.toPersistence(entity)

    // Aggregate identity must remain immutable.
    delete (changes as Partial<typeof changes>).id

    try {
      const updated = await this.model
        .findOneAndUpdate(
          {
            id: entity.id.value,
            revision: expectedRevision,
          },
          {
            $set: changes,
            $inc: { revision: 1 },
          },
          {
            returnDocument: 'after',
            runValidators: true,
            session: this.session ?? undefined,
          }
        )
        .exec()

      assertUpdated(updated)

      return requireRevision(updated.revision)
    } catch (error: unknown) {
      mapWriteError(error)
    }
  }
}
