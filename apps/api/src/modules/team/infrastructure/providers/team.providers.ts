import { Provider } from '@nestjs/common'
import { TEAM_REPOSITORY } from '../../application/ports/team-repository.port'
import { MongoTeamRepository } from '../persistance/adaptors/mongo-team-repository.adaptor'
import { TEAM_MEMBER_REPOSITORY } from '../../application/ports/team-member-repository.port'
import { MongoTeamMemberRepository } from '../persistance/adaptors/mongo-team-member-repository.adaptor'
import { TEAM_QUERY_REPOSITORY } from '../../application/ports/team-query-repository.port'
import { MongoTeamQueryRepository } from '../persistance/adaptors/mongo-team-query-repository.adaptor'

export const teamProviders: Provider[] = [
  { provide: TEAM_REPOSITORY, useClass: MongoTeamRepository },
  { provide: TEAM_QUERY_REPOSITORY, useClass: MongoTeamQueryRepository },
  { provide: TEAM_MEMBER_REPOSITORY, useClass: MongoTeamMemberRepository },
]
