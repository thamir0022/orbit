import { Injectable, Optional } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import type { ClientSession, HydratedDocument, Model } from 'mongoose'
import { FileScope, StorageUsage } from '@/modules/file/domain'
import type { StorageUsageRepository } from '@/modules/file/application/ports/repositories/storage-usage-repository.port'
import type { RepositorySnapshot } from '@/modules/file/application/ports/repositories/repository-snapshot'
import { StorageUsageMapper } from '../mappers/storage-usage.mapper'
import { StorageUsageMongoModel } from '../schemas/storage-usage.schema'
import {
  assertUpdated,
  mapWriteError,
  requireRevision,
} from '../utils/mongo-mapping.utils'

/** Mongoose repository for scoped storage quota aggregates. */
@Injectable()
export class MongoStorageUsageRepository implements StorageUsageRepository {
  constructor(
    @InjectModel(StorageUsageMongoModel.name)
    private readonly model: Model<StorageUsageMongoModel>,

    @Optional()
    private readonly session: ClientSession | null = null
  ) {}

  /** Creates a repository bound to an existing MongoDB transaction. */
  withSession(session: ClientSession): MongoStorageUsageRepository {
    return new MongoStorageUsageRepository(this.model, session)
  }

  private snapshot(
    doc: HydratedDocument<StorageUsageMongoModel>
  ): RepositorySnapshot<StorageUsage> {
    return {
      entity: StorageUsageMapper.toDomain(doc),
      revision: requireRevision(doc.revision),
    }
  }

  async findByScope(
    scope: FileScope
  ): Promise<RepositorySnapshot<StorageUsage> | null> {
    const doc = await this.model
      .findOne({
        'scope.type': scope.type,
        'scope.id': scope.id,
      })
      .session(this.session)
      .exec()

    return doc ? this.snapshot(doc) : null
  }

  async insert(entity: StorageUsage): Promise<void> {
    try {
      await new this.model({
        ...StorageUsageMapper.toPersistence(entity),
        revision: 0,
      }).save({
        session: this.session ?? undefined,
      })
    } catch (error: unknown) {
      mapWriteError(error)
    }
  }

  async update(
    entity: StorageUsage,
    expectedRevision: number
  ): Promise<number> {
    requireRevision(expectedRevision)

    const changes = StorageUsageMapper.toPersistence(entity)

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
