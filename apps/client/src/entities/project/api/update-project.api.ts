import { httpClient } from '@/shared/api/config/http-client'
import { API_ROUTES } from '@/shared/api/routes/api.routes'

import type { UpdateProjectInput } from '../model/project.types'

type UpdateProjectChanges = Omit<UpdateProjectInput, 'workspaceId' | 'key'>

export const updateProjectApi = async (
  input: UpdateProjectInput
): Promise<void> => {
  if (!input.workspaceId) {
    throw new Error('Workspace context is required to update a project.')
  }

  const changes: UpdateProjectChanges = {}

  if (input.name !== undefined) {
    changes.name = input.name
  }

  if (input.description !== undefined) {
    changes.description = input.description
  }

  if (input.avatarUrl !== undefined) {
    changes.avatarUrl = input.avatarUrl
  }

  if (input.type !== undefined) {
    changes.type = input.type
  }

  if (input.stage !== undefined) {
    changes.stage = input.stage
  }

  if (input.priority !== undefined) {
    changes.priority = input.priority
  }

  if (input.status !== undefined) {
    changes.status = input.status
  }

  if (input.leadId !== undefined) {
    changes.leadId = input.leadId
  }

  if (input.startDate !== undefined) {
    changes.startDate = input.startDate
  }

  if (input.targetEndDate !== undefined) {
    changes.targetEndDate = input.targetEndDate
  }

  await httpClient.patch<void>(API_ROUTES.PROJECTS.BY_KEY(input.key), changes)
}
