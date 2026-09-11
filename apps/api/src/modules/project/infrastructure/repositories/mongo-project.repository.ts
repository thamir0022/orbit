import { ITransactionOptions } from '@/shared/application'
import {
  FindAllWorkspaceProjectsQuery,
  FindByKeyQuery,
  IProjectRepository,
} from '../../application/repositories/project.repository.interface'
import { Project } from '../../domain/entities/project.entity'
import { ProjectId } from '../../domain/value-objects'
import { ProjectDocument, ProjectModel } from '../schemas/project.schema'
import { Model, QueryFilter } from 'mongoose'
import { ProjectMapper } from '../../application/mappers/project.mapper'
import { InjectModel } from '@nestjs/mongoose'
import { WorkspaceId } from '@/modules/workspace/domain'

export class MongoProjectRepository implements IProjectRepository {
  constructor(
    @InjectModel(ProjectModel.name)
    private readonly projectModel: Model<ProjectDocument>
  ) {}

  async findById(id: ProjectId): Promise<Project | null> {
    const doc = await this.projectModel.findOne({ id: id.value }).exec()

    return doc ? ProjectMapper.toDomain(doc) : null
  }

  async findByKey({
    workspaceId,
    key,
  }: FindByKeyQuery): Promise<Project | null> {
    const doc = await this.projectModel
      .findOne({ workspaceId: workspaceId.value, key: key.value })
      .exec()

    return doc ? ProjectMapper.toDomain(doc) : null
  }

  async findAllWorkspaceProjects(
    workspaceId: WorkspaceId,
    query: FindAllWorkspaceProjectsQuery
  ): Promise<Project[]> {
    const filter: QueryFilter<ProjectDocument> = {
      workspaceId: workspaceId.value,
    }

    if (query.key) filter.key = query.key.value
    if (query.name) filter.name = query.name.value
    if (query.priority) filter.priority = query.priority
    if (query.status) filter.status = query.status
    if (query.type) filter.type = query.type

    const docs = await this.projectModel.find(filter).exec()

    return docs.map((doc) => ProjectMapper.toDomain(doc))
  }

  async save(entity: Project, options?: ITransactionOptions): Promise<void> {
    const persistence = ProjectMapper.toPersistence(entity)

    await this.projectModel.updateOne(
      {
        id: entity.projectId.value,
      },
      {
        $set: persistence,
      },
      {
        upsert: true,
        session: options?.session,
      }
    )
  }

  async delete(id: ProjectId, options?: ITransactionOptions): Promise<void> {
    await this.projectModel.deleteOne(
      { id: id.value },
      { session: options?.session }
    )
  }
}
