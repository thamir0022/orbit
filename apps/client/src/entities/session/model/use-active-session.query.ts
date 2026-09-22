import { useQuery } from '@tanstack/react-query'
import { getActiveSessionApi } from '../api/get-active-session.api'
import { sessionKeys } from './session.keys'

export const useActiveSessionQuery = () => {
  return useQuery({
    queryKey: sessionKeys.active(),
    queryFn: getActiveSessionApi,
  })
}
