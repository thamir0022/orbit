import { Module } from '@nestjs/common'
import { ProjectController } from './presentation/controllers/project.controller'
import { Projectproviders } from './infrastructure/providers/project.providers'
import { MongooseModule } from '@nestjs/mongoose'
import {
  ProjectModel,
  ProjectSchema,
} from './infrastructure/persistance/mongoose/schemas/project.schema'
import { GET_PROJECTS } from './application/usecases/get-projects.interface'
import { GetProjectsUseCase } from './application/usecases/get-projects.usecase'
import { PROJECT_REPOSITORY } from './application/ports/project-repository.port'

import {
  CREATE_PROJECT_USE_CASE,
  CreateProjectUseCase,
} from './application/usecases/create-project'

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ProjectModel.name, schema: ProjectSchema },
    ]),
  ],
  controllers: [ProjectController],
  providers: [
    ...Projectproviders,
    { provide: CREATE_PROJECT_USE_CASE, useClass: CreateProjectUseCase },
    { provide: GET_PROJECTS, useClass: GetProjectsUseCase },
  ],
  exports: [PROJECT_REPOSITORY],
})
export class ProjectModule {}
