import { API_ROUTES } from '@/shared/api/api.routes'
import { ApiResponse } from '@/shared/api/api.types'
import { axiosInstance } from '@/shared/lib/axios'

interface AccessTokenData {
  accessToken: string
}

export async function refreshTokenApi(): Promise<string> {
  const response = await axiosInstance.post<ApiResponse<AccessTokenData>>(
    API_ROUTES.AUTH.REFRESH_TOKEN
  )

  if (!response.data.success) throw new Error('Unable to fetch refresh token')

  return response.data.data.accessToken
}
