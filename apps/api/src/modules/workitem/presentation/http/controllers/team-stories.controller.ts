import { Controller, Get, Inject, Param, Query } from '@nestjs/common'

import {
  GET_TEAM_STORIES_USE_CASE,
  IGetTeamStoriesUseCase,
} from '../../../application/usecases/get-team-stories'
import { GetTeamStoriesQuery } from '../dtos/requests/get-team-stories.query'
import { CurrentAuth } from '@/shared/presentation/decorators/current-auth.decorator'

@Controller('teams/:teamKey')
export class TeamStoriesController {
  constructor(
    @Inject(GET_TEAM_STORIES_USE_CASE)
    private readonly getTeamStoriesUseCase: IGetTeamStoriesUseCase
  ) {}

  @Get('stories')
  execute(
    @CurrentAuth('workspaceId') workspaceId: string,
    @Param('teamKey') teamKey: string,
    @Query() query: GetTeamStoriesQuery
  ) {
    return this.getTeamStoriesUseCase.execute({
      workspaceId,
      teamKey,
      ...query,
    })
  }
}
