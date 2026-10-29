import { SprintAccessGuard } from './presentation/http/guards/sprint-access.guard'
import { TRANSITION_SPRINT_USE_CASE } from './application/usecases/transition-sprint/transition-sprint.interface'
import { TransitionSprintUseCase } from './application/usecases/transition-sprint/transition-sprint.usecase'
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
import {
  GET_SPRINTS_USE_CASE,
  GetSprintsUseCase,
} from './application/usecases/get-sprints'
import {
  GET_SPRINT_USE_CASE,
  GetSprintUseCase,
} from './application/usecases/get-sprint'
import {
  UPDATE_SPRINT_USE_CASE,
  UpdateSprintUseCase,
} from './application/usecases/update-sprint'

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
    // Register sprint access and lifecycle orchestration.
    SprintAccessGuard,
    { provide: TRANSITION_SPRINT_USE_CASE, useClass: TransitionSprintUseCase },
    {
      provide: CREATE_SPRINT_USE_CASE,
      useClass: CreateSprintUseCase,
    },
    {
      provide: GET_SPRINTS_USE_CASE,
      useClass: GetSprintsUseCase,
    },
    {
      provide: GET_SPRINT_USE_CASE,
      useClass: GetSprintUseCase,
    },
    {
      provide: UPDATE_SPRINT_USE_CASE,
      useClass: UpdateSprintUseCase,
    },
  ],
})
export class SprintModule {}
