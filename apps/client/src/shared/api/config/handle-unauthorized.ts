import axios, {
  type AxiosRequestConfig,
  type AxiosError,
  type AxiosResponse,
} from 'axios'
import { useUserStore } from '@/entities/user/model/user.store'
import type { UnauthorizedContext } from '@orbit/http-client'
import { API_ROUTES } from '../routes/api.routes'

const BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:5000/api/v1'

const refreshClient = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
})

let refreshPromise: Promise<void> | null = null

declare module 'axios' {
  interface AxiosRequestConfig {
    _authRetry?: boolean
  }
}

const getWorkspaceSlug = (): string | null => {
  if (typeof window === 'undefined') {
    return null
  }

  const [slug] = window.location.pathname.split('/').filter(Boolean)

  if (!slug || slug === 'workspaces' || slug === 'sign-in') {
    return null
  }

  return slug
}

const redirect = (path: string): void => {
  if (typeof window === 'undefined') {
    return
  }

  if (window.location.pathname !== path) {
    window.location.assign(path)
  }
}

const isExchangeRequest = (config: AxiosRequestConfig): boolean => {
  if (!config.url) {
    return false
  }

  const requestPath = new URL(config.url, config.baseURL ?? BASE_URL).pathname

  const exchangePath = new URL(API_ROUTES.AUTH.EXCHANGE, BASE_URL).pathname

  return requestPath === exchangePath
}

const exchangeWorkspaceToken = async (): Promise<void> => {
  const slug = getWorkspaceSlug()

  if (!slug) {
    throw new Error('Unable to determine active workspace.')
  }

  await refreshClient.post(API_ROUTES.AUTH.EXCHANGE, { slug })
}

const refreshAccessToken = (): Promise<void> => {
  if (refreshPromise) {
    return refreshPromise
  }

  refreshPromise = exchangeWorkspaceToken()
    .catch((error: unknown) => {
      useUserStore.getState().clearUser()
      redirect('/workspaces')

      throw error
    })
    .finally(() => {
      refreshPromise = null
    })

  return refreshPromise
}

export const handleUnauthorized = async ({
  error,
}: UnauthorizedContext): Promise<AxiosResponse> => {
  const request = error.config as AxiosRequestConfig | undefined

  if (!request) {
    throw error
  }

  // Never refresh/retry the exchange request itself.
  if (isExchangeRequest(request)) {
    useUserStore.getState().clearUser()
    redirect('/sign-in')

    throw error
  }

  // Prevent an infinite:
  // request → 401 → refresh → retry → 401 → refresh → ...
  if (request._authRetry) {
    throw error
  }

  request._authRetry = true

  await refreshAccessToken()

  return axios.request(request)
}
