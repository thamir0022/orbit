import { Inject, Injectable } from '@nestjs/common'

import { UserId } from '@/modules/user/domain'

import { WorkItemType } from '../../../domain/enums/work-item-type.enum'
import {
  WORK_ITEM_QUERY_REPOSITORY,
  type WorkItemQueryRepository,
} from '../../ports/work-item-query-repository.port'
import type { GetTeamStoriesInput } from './get-team-stories.input'
import type { GetTeamStoriesOutput } from './get-team-stories.output'
import { IGetTeamStoriesUseCase } from './get-team-stories.interface'
import { WorkspaceId } from '@/modules/workspace/domain'

import {
  TEAM_REPOSITORY,
  TeamRepository,
} from '@/modules/team/application/ports/team-repository.port'
import { TeamNotFoundException } from '@/modules/team/domain/exceptions'
import { TeamKey } from '@/modules/team/domain/value-objects/team-key.vo'

@Injectable()
export class GetTeamStoriesUseCase implements IGetTeamStoriesUseCase {
  constructor(
    @Inject(TEAM_REPOSITORY)
    private readonly teamRepository: TeamRepository,

    @Inject(WORK_ITEM_QUERY_REPOSITORY)
    private readonly workItemQueryRepository: WorkItemQueryRepository
  ) {}

  async execute(input: GetTeamStoriesInput): Promise<GetTeamStoriesOutput> {
    const {
      workspaceId: workspaceIdValue,
      teamKey,
      page,
      limit,
      search,
      statuses,
      priorities,
      assigneeId,
      sortField,
      sortOrder,
    } = input

    const workspaceId = WorkspaceId.create(workspaceIdValue)

    const team = await this.teamRepository.findByWorkspaceIdAndKey({
      workspaceId,
      key: TeamKey.create(teamKey),
    })

    if (!team) {
      throw new TeamNotFoundException()
    }

    const result = await this.workItemQueryRepository.findMany({
      workspaceId,
      filters: {
        teamId: team.id,
        type: WorkItemType.STORY,
        search: search?.trim() || undefined,
        statuses,
        priorities,
        assigneeId: assigneeId ? UserId.create(assigneeId) : undefined,
      },
      pagination: {
        page,
        limit,
      },
      sort: {
        field: sortField ?? 'createdAt',
        order: sortOrder ?? 'desc',
      },
    })

    return {
      items: result.items,
      total: result.total,
      page: result.page,
      limit: result.limit,
      hasNextPage: result.hasNextPage,
    }
  }
}
