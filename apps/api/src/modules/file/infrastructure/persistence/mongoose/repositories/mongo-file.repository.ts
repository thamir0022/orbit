import { Injectable, Optional } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import type { ClientSession, HydratedDocument, Model } from 'mongoose'
import { File, FileId, FileStatus } from '@/modules/file/domain'
import type { FileRepository } from '@/modules/file/application/ports/repositories/file-repository.port'
import type { RepositorySnapshot } from '@/modules/file/application/ports/repositories/repository-snapshot'
import { FileMapper } from '../mappers/file.mapper'
import { FileMongoModel } from '../schemas/file.schema'
import {
  assertUpdated,
  mapWriteError,
  requireRevision,
  boundedLimit,
} from '../utils/mongo-mapping.utils'

/** Mongoose repository for File aggregates. */
@Injectable()
export class MongoFileRepository implements FileRepository {
  constructor(
    @InjectModel(FileMongoModel.name)
    private readonly model: Model<FileMongoModel>,

    @Optional()
    private readonly session: ClientSession | null = null
  ) {}

  /** Creates a repository bound to an existing MongoDB transaction. */
  withSession(session: ClientSession): MongoFileRepository {
    return new MongoFileRepository(this.model, session)
  }

  private snapshot(
    doc: HydratedDocument<FileMongoModel>
  ): RepositorySnapshot<File> {
    return {
      entity: FileMapper.toDomain(doc),
      revision: requireRevision(doc.revision),
    }
  }

  async findById(id: FileId): Promise<RepositorySnapshot<File> | null> {
    const doc = await this.model
      .findOne({ id: id.value })
      .session(this.session)
      .exec()

    return doc ? this.snapshot(doc) : null
  }

  async insert(entity: File): Promise<void> {
    try {
      await new this.model({
        ...FileMapper.toPersistence(entity),
        revision: 0,
      }).save({
        session: this.session ?? undefined,
      })
    } catch (error: unknown) {
      mapWriteError(error)
    }
  }

  async findByIds(
    ids: readonly FileId[]
  ): Promise<ReadonlyArray<RepositorySnapshot<File>>> {
    if (ids.length === 0) return []
    const records = await this.model
      .find({ id: { $in: ids.map((id) => id.value) } })
      .session(this.session)
      .exec()
    return records.map((doc) => this.snapshot(doc))
  }

  async findDeletedBefore(
    before: Date,
    limit: number
  ): Promise<ReadonlyArray<RepositorySnapshot<File>>> {
    const records = await this.model
      .find({
        status: FileStatus.DELETED,
        deletedAt: { $lte: before },
        purgedAt: null,
        storageObject: { $ne: null },
      })
      .sort({ purgeAttemptedAt: 1, deletedAt: 1 })
      .limit(boundedLimit(limit))
      .session(this.session)
      .exec()
    return records.map((doc) => this.snapshot(doc))
  }

  async update(entity: File, expectedRevision: number): Promise<number> {
    requireRevision(expectedRevision)

    const changes = FileMapper.toPersistence(entity)

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
