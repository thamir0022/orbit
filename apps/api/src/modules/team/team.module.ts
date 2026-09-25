import { Module } from '@nestjs/common'
import { teamProviders } from './infrastructure/providers/team.providers'
import { CREATE_TEAM } from './application/usecases/create-team.interface'
import { CreateTeamUseCase } from './application/usecases/create-team.usecase'
import { TeamController } from './presentation/team.controller'
import { WorkspaceModule } from '../workspace/workspace.module'
import { MongooseModule } from '@nestjs/mongoose'
import {
  TeamModel,
  TeamSchema,
} from './infrastructure/persistance/schemas/team.schema'
import {
  TeamMemberModel,
  TeamMemberSchema,
} from './infrastructure/persistance/schemas/team-member.schema'
import { GET_TEAM } from './application/usecases/get-team.interface'
import { GetTeamUseCase } from './application/usecases/get-team.usecase'
import { GET_TEAMS } from './application/usecases/get-teams.interface'
import { GetTeamsUseCase } from './application/usecases/get-teams.usecase'
import { UPDATE_TEAM } from './application/usecases/update-team.interface'
import { UpdateTeamUseCase } from './application/usecases/update-team.usecase'
import { DELETE_TEAM } from './application/usecases/delete-team.interface'
import { DeleteTeamUseCase } from './application/usecases/delete-team.usecase'
import { ADD_TEAM_MEMBERS } from './application/usecases/add-team-members.interface'
import { AddTeamMembersUseCase } from './application/usecases/add-team-members.usecase'
import { GET_TEAM_MEMBERS } from './application/usecases/get-team-members.interface'
import { GetTeamMembersUseCase } from './application/usecases/get-team-members.usecase'

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: TeamModel.name,
        schema: TeamSchema,
      },
      {
        name: TeamMemberModel.name,
        schema: TeamMemberSchema,
      },
    ]),
    WorkspaceModule,
  ],
  providers: [
    ...teamProviders,
    {
      provide: CREATE_TEAM,
      useClass: CreateTeamUseCase,
    },
    {
      provide: GET_TEAMS,
      useClass: GetTeamsUseCase,
    },
    {
      provide: GET_TEAM,

      useClass: GetTeamUseCase,
    },
    {
      provide: UPDATE_TEAM,
      useClass: UpdateTeamUseCase,
    },
    {
      provide: DELETE_TEAM,
      useClass: DeleteTeamUseCase,
    },
    {
      provide: ADD_TEAM_MEMBERS,
      useClass: AddTeamMembersUseCase,
    },
    {
      provide: GET_TEAM_MEMBERS,
      useClass: GetTeamMembersUseCase,
    },
  ],
  controllers: [TeamController],
})
export class TeamModule {}
