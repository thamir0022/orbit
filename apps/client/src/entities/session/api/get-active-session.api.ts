import { httpClient } from '@/shared/api/config/http-client'
import { API_ROUTES } from '@/shared/api/routes/api.routes'
import type { Session } from '../model/session.types'

interface GetActiveSessionApiResponse {
  sessions: Session[]
}

export const getActiveSessionApi = async () => {
  const res = await httpClient.get<GetActiveSessionApiResponse>(
    API_ROUTES.AUTH.SESSIONS.ACTIVE
  )

  return res.data.sessions
}
