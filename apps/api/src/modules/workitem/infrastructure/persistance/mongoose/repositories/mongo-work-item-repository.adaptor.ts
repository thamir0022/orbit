import { InjectModel } from '@nestjs/mongoose'
import {
  FindWorkItemByProjectIdAndNumberProps,
  FindWorkItemByWorkspaceIdAndIdProps,
  FindWorkItemByWorkspaceIdAndKeyProps,
  FindWorkItemsByWorkspaceIdAndParentIdProps,
  WorkItemRepository,
} from '../../../../application/ports/work-item-repository.port'
import { WorkItemDocument, WorkItemSchema } from '../schemas/work-item.schema'
import { Model } from 'mongoose'
import { WorkItemMapper } from '../mappers/work-item.mapper'
import { WorkItemId } from '../../../../domain/value-objects/work-item-id.vo'
import { ITransactionOptions } from '@/shared/application'
import { WorkItem } from '../../../../domain/entities/work-item.entity'

export class MongoWorkItemRepository implements WorkItemRepository {
  constructor(
    @InjectModel(WorkItemSchema.name)
    private readonly workItemModel: Model<WorkItemDocument>
  ) {}

  async findById(
    id: WorkItemId,
    options?: ITransactionOptions
  ): Promise<WorkItem | null> {
    const query = this.workItemModel.findOne({
      id: id.value,
      deletedAt: null,
    })

    if (options?.session) {
      query.session(options.session)
    }

    const document = await query.exec()

    return document ? WorkItemMapper.toDomain(document) : null
  }

  async findByWorkspaceIdAndId(
    props: FindWorkItemByWorkspaceIdAndIdProps,
    options?: ITransactionOptions
  ): Promise<WorkItem | null> {
    const query = this.workItemModel.findOne({
      workspaceId: props.workspaceId.value,
      id: props.workItemId.value,
      deletedAt: null,
    })

    if (options?.session) {
      query.session(options.session)
    }

    const document = await query.exec()

    return document ? WorkItemMapper.toDomain(document) : null
  }

  async findByWorkspaceIdAndKey(
    props: FindWorkItemByWorkspaceIdAndKeyProps,
    options?: ITransactionOptions
  ): Promise<WorkItem | null> {
    const query = this.workItemModel.findOne({
      workspaceId: props.workspaceId.value,
      key: props.key,
      deletedAt: null,
    })

    if (options?.session) {
      query.session(options.session)
    }

    const document = await query.exec()

    return document ? WorkItemMapper.toDomain(document) : null
  }

  async findByProjectIdAndNumber(
    props: FindWorkItemByProjectIdAndNumberProps,
    options?: ITransactionOptions
  ): Promise<WorkItem | null> {
    const query = this.workItemModel.findOne({
      projectId: props.projectId.value,
      number: props.number,
      deletedAt: null,
    })

    if (options?.session) {
      query.session(options.session)
    }

    const document = await query.exec()

    return document ? WorkItemMapper.toDomain(document) : null
  }

  async findByWorkspaceIdAndParentId(
    props: FindWorkItemsByWorkspaceIdAndParentIdProps,
    options?: ITransactionOptions
  ): Promise<WorkItem[]> {
    const query = this.workItemModel
      .find({
        workspaceId: props.workspaceId.value,
        parentId: props.parentId.value,
        deletedAt: null,
      })
      .sort({ createdAt: 1 })

    if (options?.session) {
      query.session(options.session)
    }

    const documents = await query.exec()

    return documents.map((document) => WorkItemMapper.toDomain(document))
  }

  async existsByWorkspaceIdAndKey(
    props: FindWorkItemByWorkspaceIdAndKeyProps,
    options?: ITransactionOptions
  ): Promise<boolean> {
    const query = this.workItemModel.exists({
      workspaceId: props.workspaceId.value,
      key: props.key,
      deletedAt: null,
    })

    if (options?.session) {
      query.session(options.session)
    }

    return (await query.exec()) !== null
  }

  async existsByProjectIdAndNumber(
    props: FindWorkItemByProjectIdAndNumberProps,
    options?: ITransactionOptions
  ): Promise<boolean> {
    const query = this.workItemModel.exists({
      projectId: props.projectId.value,
      number: props.number,
      deletedAt: null,
    })

    if (options?.session) {
      query.session(options.session)
    }

    return (await query.exec()) !== null
  }

  async save(entity: WorkItem, options?: ITransactionOptions): Promise<void> {
    const persistenceModel = WorkItemMapper.toPersistence(entity)

    const query = this.workItemModel.updateOne(
      {
        id: entity.id.value,
      },
      {
        $set: persistenceModel,
      },
      {
        upsert: true,
        runValidators: true,
      }
    )

    if (options?.session) {
      query.session(options.session)
    }

    await query.exec()
  }

  async delete(id: WorkItemId, options?: ITransactionOptions): Promise<void> {
    const now = new Date()

    const query = this.workItemModel.updateOne(
      {
        id: id.value,
        deletedAt: null,
      },
      {
        $set: {
          deletedAt: now,
          updatedAt: now,
        },
      }
    )

    if (options?.session) {
      query.session(options.session)
    }

    await query.exec()
  }
}
