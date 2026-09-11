// src/entities/project/model/project.queries.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createWorkspaceProject,
  getWorkspaceProjects,
} from '../api/projects.api'
import type {
  CreateProjectInput,
  GetWorkspaceProjectsParams,
  Project,
} from './types'

export const projectQueryKeys = {
  all: ['projects'] as const,
  workspace: (workspaceId: string) =>
    [...projectQueryKeys.all, workspaceId] as const,
  list: (workspaceId: string, params: GetWorkspaceProjectsParams) =>
    [...projectQueryKeys.workspace(workspaceId), 'list', params] as const,
}

export function useWorkspaceProjects(
  workspaceId: string,
  params: GetWorkspaceProjectsParams
) {
  return useQuery({
    queryKey: projectQueryKeys.list(workspaceId, params),
    queryFn: () => getWorkspaceProjects(params),
    enabled: Boolean(workspaceId),
    placeholderData: (previous) => previous,
    staleTime: 30_000,
  })
}

export function useCreateWorkspaceProject(workspaceId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: CreateProjectInput) => createWorkspaceProject(body),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: projectQueryKeys.workspace(workspaceId),
      })
    },
  })
}
