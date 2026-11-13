import { Injectable, Optional } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import type { ClientSession, HydratedDocument, Model } from 'mongoose'
import { Attachment, AttachmentId, FileId } from '@/modules/file/domain'
import type {
  AttachmentPageQuery,
  AttachmentRepository,
} from '@/modules/file/application/ports/repositories/attachment-repository.port'
import type { RepositorySnapshot } from '@/modules/file/application/ports/repositories/repository-snapshot'
import { AttachmentMapper } from '../mappers/attachment.mapper'
import { AttachmentMongoModel } from '../schemas/attachment.schema'
import {
  assertUpdated,
  boundedLimit,
  mapWriteError,
  requireRevision,
} from '../utils/mongo-mapping.utils'

/** Mongoose repository for attachment aggregates. */
@Injectable()
export class MongoAttachmentRepository implements AttachmentRepository {
  constructor(
    @InjectModel(AttachmentMongoModel.name)
    private readonly model: Model<AttachmentMongoModel>,

    @Optional()
    private readonly session: ClientSession | null = null
  ) {}

  /** Creates a repository bound to an existing MongoDB transaction. */
  withSession(session: ClientSession): MongoAttachmentRepository {
    return new MongoAttachmentRepository(this.model, session)
  }

  private snapshot(
    doc: HydratedDocument<AttachmentMongoModel>
  ): RepositorySnapshot<Attachment> {
    return {
      entity: AttachmentMapper.toDomain(doc),
      revision: requireRevision(doc.revision),
    }
  }

  async findById(
    id: AttachmentId
  ): Promise<RepositorySnapshot<Attachment> | null> {
    const doc = await this.model
      .findOne({ id: id.value })
      .session(this.session)
      .exec()

    return doc ? this.snapshot(doc) : null
  }

  async findActiveByTarget(
    query: AttachmentPageQuery
  ): Promise<ReadonlyArray<RepositorySnapshot<Attachment>>> {
    const records = await this.model
      .find({
        workspaceId: query.workspaceId.value,
        'target.type': query.target.type,
        'target.id': query.target.id,
        deletedAt: null,
      })
      .sort({
        position: 1,
        createdAt: 1,
        _id: 1,
      })
      .limit(boundedLimit(query.limit, 101))
      .session(this.session)
      .exec()

    return records.map((doc) => this.snapshot(doc))
  }

  async hasActiveReferences(fileId: FileId): Promise<boolean> {
    const result = await this.model
      .exists({
        fileId: fileId.value,
        deletedAt: null,
      })
      .session(this.session)
      .exec()

    return result !== null
  }

  async nextPosition(
    query: Omit<AttachmentPageQuery, 'limit'>
  ): Promise<number> {
    const last = await this.model
      .findOne({
        workspaceId: query.workspaceId.value,
        'target.type': query.target.type,
        'target.id': query.target.id,
        deletedAt: null,
      })
      .sort({ position: -1 })
      .session(this.session)
      .exec()
    return last ? last.position + 1 : 0
  }

  async findActiveLink(
    query: Omit<AttachmentPageQuery, 'limit'> & { readonly fileId: FileId }
  ): Promise<RepositorySnapshot<Attachment> | null> {
    const doc = await this.model
      .findOne({
        workspaceId: query.workspaceId.value,
        fileId: query.fileId.value,
        'target.type': query.target.type,
        'target.id': query.target.id,
        deletedAt: null,
      })
      .session(this.session)
      .exec()
    return doc ? this.snapshot(doc) : null
  }

  async insert(entity: Attachment): Promise<void> {
    try {
      await new this.model({
        ...AttachmentMapper.toPersistence(entity),
        revision: 0,
      }).save({
        session: this.session ?? undefined,
      })
    } catch (error: unknown) {
      mapWriteError(error)
    }
  }

  async update(entity: Attachment, expectedRevision: number): Promise<number> {
    requireRevision(expectedRevision)

    const changes = AttachmentMapper.toPersistence(entity)

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
            runValidators: true,
            session: this.session ?? undefined,
            returnDocument: 'after',
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
