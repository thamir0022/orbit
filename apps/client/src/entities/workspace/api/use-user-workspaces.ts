import { useQuery } from '@tanstack/react-query'

import { getUserWorkspacesApi } from './ger-user-workspaces.api'

export function useUserWorkspaces() {
  return useQuery({
    queryKey: ['workspaces'],
    queryFn: getUserWorkspacesApi,
  })
}
