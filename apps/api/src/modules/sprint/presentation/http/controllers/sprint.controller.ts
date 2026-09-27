import { Body, Controller, Inject, Post } from '@nestjs/common'
import {
  CREATE_SPRINT_USE_CASE,
  ICreateSprintUseCase,
} from '../../../application/usecases/create-sprint'
import { CurrentAuth } from '@/shared/presentation/decorators/current-auth.decorator'
import { CreateSprintRequest, CreateSprintResponse } from '../dtos'
import { AuthContext } from '@/shared/domain/types'

@Controller('sprints')
export class SprintController {
  constructor(
    @Inject(CREATE_SPRINT_USE_CASE)
    private readonly createSprintUseCase: ICreateSprintUseCase
  ) {}

  @Post()
  async createSprint(
    @CurrentAuth() auth: AuthContext,
    @Body() req: CreateSprintRequest
  ): Promise<CreateSprintResponse> {
    const { teamId, name, goal, description, startDate, endDate } = req

    return this.createSprintUseCase.execute({
      workspaceId: auth.workspaceId!,
      actorId: auth.userId,
      teamId,
      name,
      goal,
      description,
      startDate,
      endDate,
    })
  }
}
