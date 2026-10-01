import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'

import {
  FindProjectByWorkspaceIdAndKeyProps,
  ProjectRepository,
} from '../../../application/ports/project-repository.port'
import { ProjectDocument, ProjectModel } from '../schemas/project.schema'

import { ITransactionOptions } from '@/shared/application'

import { ProjectId } from '../../../domain'
import { Project } from '../../../domain/entities/project.entity'
import { ProjectMapper } from '../../../application/mappers/project.mapper'

@Injectable()
export class MongoProjectRepository implements ProjectRepository {
  constructor(
    @InjectModel(ProjectModel.name)
    private readonly projectModel: Model<ProjectDocument>
  ) {}

  async findById(
    id: ProjectId,
    options?: ITransactionOptions
  ): Promise<Project | null> {
    const query = this.projectModel.findOne({
      id: id.value,
      deletedAt: null,
    })

    if (options?.session) {
      query.session(options.session)
    }

    const document = await query.exec()

    return document ? ProjectMapper.toDomain(document) : null
  }

  async findByWorkspaceIdAndKey(
    props: FindProjectByWorkspaceIdAndKeyProps,
    options?: ITransactionOptions
  ): Promise<Project | null> {
    const query = this.projectModel.findOne({
      workspaceId: props.workspaceId.value,
      key: props.key,
      deletedAt: null,
    })

    if (options?.session) {
      query.session(options.session)
    }

    const document = await query.exec()

    return document ? ProjectMapper.toDomain(document) : null
  }

  async save(entity: Project, options?: ITransactionOptions): Promise<void> {
    const persistence = ProjectMapper.toPersistence(entity)

    const query = this.projectModel.replaceOne(
      {
        id: entity.projectId.value,
      },
      persistence,
      {
        upsert: true,
        timestamps: false,
      }
    )

    if (options?.session) {
      query.session(options.session)
    }

    await query.exec()
  }

  async delete(id: ProjectId, options?: ITransactionOptions): Promise<void> {
    const query = this.projectModel.deleteOne({
      id: id.value,
    })

    if (options?.session) {
      query.session(options.session)
    }

    await query.exec()
  }
}
