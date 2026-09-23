import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
} from '@nestjs/common'
import {
  CREATE_TEAM,
  ICreateTeamUseCase,
} from '../application/usecases/create-team.interface'
import { CreateTeamRequest, CreateTeamResponse, GetTeamRequest } from './dtos'
import { CurrentAuth } from '@/shared/presentation/decorators/current-auth.decorator'
import { AuthContext } from '@/shared/domain/types'
import {
  GET_TEAM,
  IGetTeamUseCase,
} from '../application/usecases/get-team.interface'
import {
  GET_TEAMS,
  IGetTeamsUseCase,
} from '../application/usecases/get-teams.interface'
import {
  IUpdateTeamUseCase,
  UPDATE_TEAM,
} from '../application/usecases/update-team.interface'
import { UpdateTeamResponse } from './dtos/responses/update-team.response'
import { UpdateTeamRequest } from './dtos/requests/update-team.request'
import {
  DELETE_TEAM,
  IDeleteTeamUseCase,
} from '../application/usecases/delete-team.interface'
import { ResponseMessage } from '@/shared/presentation/decorators/response-message.decorator'
import { TeamResponseMessage } from './enums/response-message.enum'

@Controller('teams')
export class TeamController {
  constructor(
    @Inject(CREATE_TEAM)
    private readonly createTeamUseCase: ICreateTeamUseCase,
    @Inject(GET_TEAM)
    private readonly getTeamUseCase: IGetTeamUseCase,
    @Inject(GET_TEAMS)
    private readonly getTeamsUseCase: IGetTeamsUseCase,
    @Inject(UPDATE_TEAM)
    private readonly updateTeamUseCase: IUpdateTeamUseCase,
    @Inject(DELETE_TEAM)
    private readonly deleteTeamUseCase: IDeleteTeamUseCase
  ) {}

  @Post()
  @ResponseMessage(TeamResponseMessage.TEAM_CREATED)
  async createTeam(
    @CurrentAuth() auth: AuthContext,
    @Body() req: CreateTeamRequest
  ): Promise<CreateTeamResponse> {
    const { name, description, avatarUrl, leadId } = req
    return this.createTeamUseCase.execute({
      workspaceId: auth.workspaceId!,
      name,
      description,
      avatarUrl,
      leadId,
      createdBy: auth.userId,
    })
  }

  @Get()
  @ResponseMessage(TeamResponseMessage.TEAMS_FETCHED)
  async getTeams(@CurrentAuth('workspaceId') workspaceId: string) {
    return this.getTeamsUseCase.execute({ workspaceId })
  }

  @Get(':teamId')
  @ResponseMessage(TeamResponseMessage.TEAM_FETCHED)
  async getTeam(
    @CurrentAuth() auth: AuthContext,
    @Param() req: GetTeamRequest
  ) {
    return this.getTeamUseCase.execute({
      workspaceId: auth.workspaceId!,
      teamId: req.teamId,
    })
  }

  @Put(':teamId')
  @ResponseMessage(TeamResponseMessage.TEAM_UPDATED)
  async updateTeam(
    @CurrentAuth('workspaceId') workspaceId: string,
    @Param('teamId', new ParseUUIDPipe()) teamId: string,
    @Body() req: UpdateTeamRequest
  ): Promise<UpdateTeamResponse> {
    const { name, description, avatarUrl, leadId, status } = req

    return this.updateTeamUseCase.execute({
      workspaceId,
      teamId,
      name,
      description,
      avatarUrl,
      leadId,
      status,
    })
  }

  @Delete(':teamId')
  @ResponseMessage(TeamResponseMessage.TEAM_DELETED)
  async deleteTeam(
    @CurrentAuth() auth: AuthContext,
    @Param('teamId') teamId: string
  ) {
    return this.deleteTeamUseCase.execute({
      workspaceId: auth.workspaceId!,
      userId: auth.userId,
      teamId,
    })
  }
}
