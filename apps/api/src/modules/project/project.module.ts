import { Module } from '@nestjs/common'

import { MongooseModule } from '@nestjs/mongoose'

import { ProjectController } from './presentation/controllers/project.controller'
import { Projectproviders } from './infrastructure/providers/project.providers'

import {
  ProjectModel,
  ProjectSchema,
} from './infrastructure/persistance/mongoose/schemas/project.schema'

import { PROJECT_REPOSITORY } from './application/ports/project-repository.port'

import {
  CREATE_PROJECT_USE_CASE,
  CreateProjectUseCase,
} from './application/usecases/create-project'
import {
  GET_PROJECTS_USE_CASE,
  GetProjectsUseCase,
} from './application/usecases/get-projects'
import {
  ProjectCounterModel,
  ProjectCounterSchema,
} from './infrastructure/persistance/mongoose/schemas/project-counter.schema'
import {
  GET_PROJECT_USE_CASE,
  GetProjectUseCase,
} from './application/usecases/get-project'
import {
  UPDATE_PROJECT_USE_CASE,
  UpdateProjectUseCase,
} from './application/usecases/update-project'
import { WorkspaceModule } from '../workspace/workspace.module'
import {
  DELETE_PROJECT_USE_CASE,
  DeleteProjectUseCase,
} from './application/usecases/delete-project'

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: ProjectModel.name,
        schema: ProjectSchema,
      },
      {
        name: ProjectCounterModel.name,
        schema: ProjectCounterSchema,
      },
    ]),

    WorkspaceModule,
  ],
  controllers: [ProjectController],
  providers: [
    ...Projectproviders,
    {
      provide: CREATE_PROJECT_USE_CASE,
      useClass: CreateProjectUseCase,
    },
    {
      provide: GET_PROJECTS_USE_CASE,
      useClass: GetProjectsUseCase,
    },
    {
      provide: GET_PROJECT_USE_CASE,
      useClass: GetProjectUseCase,
    },
    {
      provide: UPDATE_PROJECT_USE_CASE,
      useClass: UpdateProjectUseCase,
    },
    {
      provide: DELETE_PROJECT_USE_CASE,
      useClass: DeleteProjectUseCase,
    },
  ],
  exports: [PROJECT_REPOSITORY],
})
export class ProjectModule {}
