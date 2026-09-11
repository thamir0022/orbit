import { Module } from '@nestjs/common'
import { ProjectController } from './presentation/controllers/project.controller'
import { Projectproviders } from './infrastructure/providers/project.providers'
import { CREATE_PROJECT } from './application/usecases/create-project.interface'
import { CreateProjectUseCase } from './application/usecases/create-project.usecase'
import { MongooseModule } from '@nestjs/mongoose'
import {
  ProjectModel,
  ProjectSchema,
} from './infrastructure/schemas/project.schema'
import { GET_PROJECTS } from './application/usecases/get-projects.interface'
import { GetProjectsUseCase } from './application/usecases/get-projects.usecase'

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ProjectModel.name, schema: ProjectSchema },
    ]),
  ],
  controllers: [ProjectController],
  providers: [
    ...Projectproviders,
    { provide: CREATE_PROJECT, useClass: CreateProjectUseCase },
    { provide: GET_PROJECTS, useClass: GetProjectsUseCase },
  ],
})
export class ProjectModule {}
