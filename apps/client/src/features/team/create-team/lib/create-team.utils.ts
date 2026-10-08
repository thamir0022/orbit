import type { CreateTeamPayload } from '@/entities/team'

import type { CreateTeamFormValues } from '../model/create-team.schema'

export const buildCreateTeamRequest = (
  values: CreateTeamFormValues
): CreateTeamPayload => {
  const name = values.name.trim()
  const description = values.description?.trim()

  return {
    name,
    ...(description && { description }),
    ...(values.leadId && { leadId: values.leadId }),
    ...(values.memberIds.length > 0 && {
      memberIds: values.memberIds,
    }),
  }
}
