import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import {
  WorkItemModel,
  WorkItemSchema,
} from './infrastructure/persistance/mongoose/schemas/work-item.schema'
import { WorkItemProviders } from './infrastructure/providers/work-item.provider'
import {
  TeamWorkItemCounterModel,
  TeamWorkItemCounterSchema,
} from './infrastructure/persistance/mongoose/schemas/work-item-counter.schema'
import { WorkItemController } from './presentation/http/controllers/work-item.controller'
import {
  CREATE_WORK_ITEM_USE_CASE,
  CreateWorkItemUseCase,
} from './application/usecases/create-work-item'
import {
  GET_WORK_ITEMS_USE_CASE,
  GetWorkItemsUseCase,
} from './application/usecases/get-workitems'
import {
  GET_WORK_ITEM_USE_CASE,
  GetWorkItemUseCase,
} from './application/usecases/get-workitem'
import {
  DELETE_WORK_ITEM_USE_CASE,
  DeleteWorkItemUseCase,
} from './application/usecases/delete-workitem'
import {
  UPDATE_WORK_ITEM_USE_CASE,
  UpdateWorkItemUseCase,
} from './application/usecases/update-workitem'
import {
  GET_TEAM_STORIES_USE_CASE,
  GetTeamStoriesUseCase,
} from './application/usecases/get-team-stories'
import { TeamModule } from '../team/team.module'
import { TeamStoriesController } from './presentation/http/controllers/team-stories.controller'
import { WorkspaceModule } from '../workspace/workspace.module'
import { ProjectModule } from '../project/project.module'
import {
  TEAM_STORY_CONTEXT_SERVICE,
  TeamStoryContextService,
} from './application/services/team-story-context.service'
import {
  CREATE_TEAM_STORY_USE_CASE,
  CreateTeamStoryUseCase,
} from './application/usecases/create-team-story'
import {
  UPDATE_TEAM_STORY_USE_CASE,
  UpdateTeamStoryUseCase,
} from './application/usecases/update-team-story'
import {
  DELETE_TEAM_STORY_USE_CASE,
  DeleteTeamStoryUseCase,
} from './application/usecases/delete-team-story'

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: WorkItemModel.name,
        schema: WorkItemSchema,
      },
      {
        name: TeamWorkItemCounterModel.name,
        schema: TeamWorkItemCounterSchema,
      },
    ]),
    TeamModule,
    WorkspaceModule,
    ProjectModule,
  ],
  providers: [
    ...WorkItemProviders,
    {
      provide: TEAM_STORY_CONTEXT_SERVICE,
      useClass: TeamStoryContextService,
    },
    {
      provide: CREATE_TEAM_STORY_USE_CASE,
      useClass: CreateTeamStoryUseCase,
    },
    {
      provide: UPDATE_TEAM_STORY_USE_CASE,
      useClass: UpdateTeamStoryUseCase,
    },
    {
      provide: DELETE_TEAM_STORY_USE_CASE,
      useClass: DeleteTeamStoryUseCase,
    },
    {
      provide: CREATE_WORK_ITEM_USE_CASE,
      useClass: CreateWorkItemUseCase,
    },
    {
      provide: GET_WORK_ITEMS_USE_CASE,
      useClass: GetWorkItemsUseCase,
    },
    {
      provide: GET_WORK_ITEM_USE_CASE,
      useClass: GetWorkItemUseCase,
    },
    {
      provide: DELETE_WORK_ITEM_USE_CASE,
      useClass: DeleteWorkItemUseCase,
    },
    {
      provide: UPDATE_WORK_ITEM_USE_CASE,
      useClass: UpdateWorkItemUseCase,
    },
    {
      provide: GET_TEAM_STORIES_USE_CASE,
      useClass: GetTeamStoriesUseCase,
    },
  ],
  controllers: [WorkItemController, TeamStoriesController],
})
export class WorkItemModule {}
