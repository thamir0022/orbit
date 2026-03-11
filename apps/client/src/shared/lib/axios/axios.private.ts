import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios'
import { useUserStore } from '@/entities/user/model/user.store'
import { API_ROUTES } from '@/shared/api/api.routes'
import { rootDomain } from '../utils'
import { refreshTokenApi } from '@/features/auth/refresh-token/api/refresh-token.api'

// ----------------------------------------------------------------------
// 1. Tenant Extraction Utility
// ----------------------------------------------------------------------
function getTenantFromWindow(): string | null {
  if (typeof window === 'undefined') return null

  const hostname = window.location.hostname
  const isLocalhost = hostname.includes('localhost')

  // Ignore the root domain or www
  if (
    hostname !== rootDomain &&
    hostname !== `www.${rootDomain}` &&
    !isLocalhost
  ) {
    return hostname.split('.')[0]
  }

  // Handle local development (e.g., acme.localhost)
  if (isLocalhost && hostname !== 'localhost') {
    return hostname.split('.')[0]
  }

  return null
}

// ----------------------------------------------------------------------
// 2. Instance Creation
// ----------------------------------------------------------------------
export const privateAxios = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // Crucial: Allows Axios to send the HTTP-only refresh token cookie automatically
  withCredentials: true,
})

// ----------------------------------------------------------------------
// 3. Request Interceptor (Inject Token & Tenant)
// ----------------------------------------------------------------------
privateAxios.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // A. Inject Tenant ID
    const tenantId = getTenantFromWindow()
    if (tenantId) {
      config.headers['x-tenant-id'] = tenantId
    }

    // B. Inject Access Token from Zustand
    // We use .getState() to access Zustand outside of a React component
    const accessToken = useUserStore.getState().accessToken
    if (accessToken) {
      config.headers['Authorization'] = `Bearer ${accessToken}`
    }

    return config
  },
  (error) => Promise.reject(error)
)

// ----------------------------------------------------------------------
// 4. Response Interceptor (Handle 401s & Refresh Queue)
// ----------------------------------------------------------------------
let isRefreshing = false
let failedQueue: Array<{
  resolve: (value?: unknown) => void
  reject: (reason?: unknown) => void
}> = []

const processQueue = (
  error: AxiosError | null,
  token: string | null = null
) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })
  failedQueue = []
}

privateAxios.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean
    }

    // If the error is 401 and we haven't already retried this request
    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry
    ) {
      // Prevent infinite loops if the refresh endpoint itself returns 401
      if (originalRequest.url === API_ROUTES.AUTH.REFRESH_TOKEN) {
        useUserStore.getState().setAccessToken(null)
        window.location.assign('/sign-in')
        return Promise.reject(error)
      }

      if (isRefreshing) {
        // If currently refreshing, put the request in a queue to wait
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then((token) => {
            originalRequest.headers['Authorization'] = `Bearer ${token}`
            return privateAxios(originalRequest)
          })
          .catch((err) => Promise.reject(err))
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        const newAccessToken = await refreshTokenApi()

        // Update Zustand store
        useUserStore.getState().setAccessToken(newAccessToken)

        // Process the queue so all waiting requests can retry
        processQueue(null, newAccessToken)

        // Retry the original failed request
        originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`
        return privateAxios(originalRequest)
      } catch (refreshError) {
        processQueue(refreshError as AxiosError, null)

        // If refresh fails, the user is truly logged out
        useUserStore.getState().setAccessToken(null)
        window.location.assign('/sign-in')

        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  }
)
