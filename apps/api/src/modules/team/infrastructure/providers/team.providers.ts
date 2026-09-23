import { Provider } from '@nestjs/common'
import { TEAM_REPOSITORY } from '../../application/ports/team-repository.port'
import { MongoTeamRepository } from '../persistance/adaptors/mongo-team-repository.adaptor'
import { TEAM_MEMBER_REPOSITORY } from '../../application/ports/team-member-repository.port'
import { MongoTeamMemberRepository } from '../persistance/adaptors/mongo-team-member-repository.adaptor'

export const teamProviders: Provider[] = [
  { provide: TEAM_REPOSITORY, useClass: MongoTeamRepository },
  { provide: TEAM_MEMBER_REPOSITORY, useClass: MongoTeamMemberRepository },
]
