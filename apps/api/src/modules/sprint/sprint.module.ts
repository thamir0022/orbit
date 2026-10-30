import { SPRINT_TRANSACTION_MANAGER } from './application/ports/sprint-transaction-manager.port'
import { SprintTransactionManager } from './infrastructure/providers/sprint-transaction-manager'
import { SPRINT_WORK_ITEM_REPOSITORY } from './application/ports/sprint-work-item-repository.port'
import { MongoSprintWorkItemRepository } from './infrastructure/persistance/mongoose/repositories/mongo-sprint-work-item.repository'
import {
  SPRINT_WORK_ITEM_MODEL,
  SprintWorkItemSchema,
} from './infrastructure/persistance/mongoose/schemas/sprint-work-item.schema'
import { SprintScopeController } from './presentation/http/controllers/sprint-scope.controller'
import {
  SPRINT_CONTEXT_SERVICE,
  SprintContextService,
} from './application/services/sprint-context.service'
import {
  SPRINT_SNAPSHOT_SERVICE,
  SprintSnapshotService,
} from './application/services/sprint-snapshot.service'
import {
  MANAGE_SPRINT_SCOPE,
  ManageSprintScopeUseCase,
} from './application/usecases/manage-sprint-scope'
import {
  GET_SPRINT_WORK_ITEMS,
  GetSprintWorkItemsUseCase,
} from './application/usecases/get-sprint-work-items'
import {
  GET_SPRINT_SUMMARY,
  GetSprintSummaryUseCase,
} from './application/usecases/get-sprint-summary'
import {
  DELETE_SPRINT,
  DeleteSprintUseCase,
} from './application/usecases/delete-sprint'
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
        name: SPRINT_WORK_ITEM_MODEL,
        schema: SprintWorkItemSchema,
      },
      {
        name: SprintModel.name,
        schema: SprintSchema,
      },
    ]),
    TeamModule,
    WorkspaceModule,
  ],
  controllers: [SprintScopeController, SprintController],
  providers: [
    ...sprintProviders,
    {
      provide: SPRINT_TRANSACTION_MANAGER,
      useClass: SprintTransactionManager,
    },
    {
      provide: SPRINT_WORK_ITEM_REPOSITORY,

      useClass: MongoSprintWorkItemRepository,
    },
    {
      provide: SPRINT_CONTEXT_SERVICE,
      useClass: SprintContextService,
    },
    {
      provide: SPRINT_SNAPSHOT_SERVICE,
      useClass: SprintSnapshotService,
    },
    {
      provide: MANAGE_SPRINT_SCOPE,
      useClass: ManageSprintScopeUseCase,
    },
    {
      provide: GET_SPRINT_WORK_ITEMS,
      useClass: GetSprintWorkItemsUseCase,
    },
    {
      provide: GET_SPRINT_SUMMARY,
      useClass: GetSprintSummaryUseCase,
    },
    {
      provide: DELETE_SPRINT,
      useClass: DeleteSprintUseCase,
    },
    // Register sprint access and lifecycle orchestration.
    SprintAccessGuard,
    {
      provide: TRANSITION_SPRINT_USE_CASE,
      useClass: TransitionSprintUseCase,
    },
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
