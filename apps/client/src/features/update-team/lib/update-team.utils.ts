import type { Team } from '@/entities/team/model/team.types'

import type { UpdateTeamFormValues } from '../model/update-team.schema'

export function getUpdateTeamDefaultValues(team: Team): UpdateTeamFormValues {
  return {
    name: team.name,
    description: team.description ?? '',
    leadId: team.lead?.id ?? '',
    status: team.status ?? '',
  }
}
