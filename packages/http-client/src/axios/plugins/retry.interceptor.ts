import type { AxiosError } from 'axios'
import { AxiosInterceptor } from '../types/axios.types'

export interface RetryInterceptorOptions {
  /**
   * Maximum retry attempts.
   *
   * @default 1
   */
  retries?: number

  /**
   * Delay between retries.
   *
   * @default 500
   */
  retryDelay?: number
}

export function retryInterceptor({
  retries = 1,
  retryDelay = 500,
}: RetryInterceptorOptions = {}): AxiosInterceptor {
  return (client) => {
    client.interceptors.response.use(
      (response) => response,

      async (error: AxiosError) => {
        const config = error.config as AxiosError['config'] & {
          __retryCount?: number
        }

        if (!config) {
          return Promise.reject(error)
        }

        config.__retryCount ??= 0

        if (config.__retryCount >= retries) {
          return Promise.reject(error)
        }

        config.__retryCount++

        await new Promise((resolve) =>
          setTimeout(resolve, retryDelay)
        )

        return client(config)
      }
    )
  }
}