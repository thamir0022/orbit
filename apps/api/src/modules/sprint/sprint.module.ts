import { Module } from '@nestjs/common'
import { sprintProviders } from './infrastructure/providers/sprint.provider'
import { MongooseModule } from '@nestjs/mongoose'
import {
  SprintModel,
  SprintSchema,
} from './infrastructure/persistance/mongoose/schemas/sprint.schema'
import {
  CREATE_SPRINT_USE_CASE,
  CreateSprintUseCase,
} from './application/usecases/create-sprint'
import { SprintController } from './presentation/http/controllers/sprint.controller'
import { TeamModule } from '../team/team.module'
import { WorkspaceModule } from '../workspace/workspace.module'

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: SprintModel.name,
        schema: SprintSchema,
      },
    ]),
    TeamModule,
    WorkspaceModule,
  ],
  controllers: [SprintController],
  providers: [
    ...sprintProviders,
    {
      provide: CREATE_SPRINT_USE_CASE,
      useClass: CreateSprintUseCase,
    },
  ],
})
export class SprintModule {}
