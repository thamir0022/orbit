import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios'
import { useUserStore } from '@/entities/user/model/user.store'
import { API_ROUTES } from '@/shared/api/api.routes'

// ----------------------------------------------------------------------
// 1. Instance Creation
// ----------------------------------------------------------------------
const BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:5000/api/v1'

export const privateAxios = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // CRITICAL: Tells the browser to always include HttpOnly cookies in the request
  withCredentials: true,
})

// ----------------------------------------------------------------------
// 2. Refresh Queue Management
// ----------------------------------------------------------------------
let isRefreshing = false
let failedQueue: Array<{
  resolve: () => void
  reject: (reason?: unknown) => void
}> = []

const processQueue = (error: AxiosError | null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error)
    } else {
      // Notice we no longer pass a token to resolve!
      // The browser handles the new cookie natively.
      prom.resolve()
    }
  })
  failedQueue = []
}

// ----------------------------------------------------------------------
// 3. Response Interceptor (Handle 401/403s & Silent Exchange)
// ----------------------------------------------------------------------
privateAxios.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean
    }

    // Catch unauthorized errors (NestJS might throw 401 or 403 for expired tokens)
    const isUnauthorized =
      error.response?.status === 401 || error.response?.status === 403

    if (isUnauthorized && originalRequest && !originalRequest._retry) {
      // 1. Prevent infinite loops if the exchange endpoint itself fails
      if (originalRequest.url === API_ROUTES.AUTH.EXCHANGE) {
        useUserStore.getState().clearUser()
        window.location.assign('/sign-in')
        return Promise.reject(error)
      }

      // 2. If already refreshing, pause this request and add it to the queue
      if (isRefreshing) {
        return new Promise<void>((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then(() => {
            // Replay the request. The browser will automatically attach the new cookie!
            return privateAxios(originalRequest)
          })
          .catch((err) => Promise.reject(err))
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        // 3. Extract the active tenant slug from the URL
        const pathSegments = window.location.pathname.split('/')
        const slug = pathSegments[1]

        // If there's no slug (e.g., they are on a global page), we can't exchange a tenant token.
        // This implies the global identity_token expired.
        if (!slug || slug === 'workspaces' || slug === 'sign-in') {
          throw new Error(
            'Global identity expired or missing workspace context'
          )
        }

        // 4. Request a fresh Tenant Token cookie via the silent exchange route
        // We use standard axios here to avoid triggering this interceptor again
        await axios.post(
          `${BASE_URL}${API_ROUTES.AUTH.EXCHANGE}`,
          { slug },
          { withCredentials: true }
        )

        // 5. Release the queue (requests will replay automatically)
        processQueue(null)

        // 6. Replay the original failed request
        return privateAxios(originalRequest)
      } catch (refreshError) {
        // If the exchange completely fails (e.g., Refresh Token expired, or user kicked from org)
        processQueue(refreshError as AxiosError)

        useUserStore.getState().clearUser()

        console.log(refreshError)

        // Bounce them to the workspace selection or sign-in page to recover
        window.location.assign('/workspaces')

        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  }
)
