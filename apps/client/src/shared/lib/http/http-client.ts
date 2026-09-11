import { privateAxios } from '../axios'
import type { ApiResponse, ApiSuccess } from '@/shared/api/api.types'
import {
  isAxiosError,
  type AxiosInstance,
  type AxiosRequestConfig,
} from 'axios'

export const httpClient = {
  async get<T>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<ApiSuccess<T>> {
    try {
      const response = await privateAxios.get<ApiResponse<T>>(url, config)
      const payload = response.data

      if (!payload.success) {
        throw payload
      }

      return payload
    } catch (error: unknown) {}
  },
  async post<T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<ApiSuccess<T>> {
    const response = await privateAxios.post<ApiResponse<T>>(url, data, config)
    const payload = response.data

    if (!payload.success) {
      throw payload
    }

    return payload
  },
  async put<T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<ApiSuccess<T>> {
    const response = await privateAxios.put<ApiResponse<T>>(url, data, config)
    const payload = response.data

    if (!payload.success) {
      throw payload
    }

    return payload
  },
  async patch<T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<ApiSuccess<T>> {
    const response = await privateAxios.patch<ApiResponse<T>>(url, data, config)
    const payload = response.data

    if (!payload.success) {
      throw payload
    }

    return payload
  },
  async delete<T>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<ApiSuccess<T>> {
    const response = await privateAxios.delete<ApiResponse<T>>(url, config)
    const payload = response.data

    if (!payload.success) {
      throw payload
    }

    return payload
  },
}
