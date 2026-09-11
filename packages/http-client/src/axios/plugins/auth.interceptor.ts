import type { AxiosError, AxiosRequestConfig } from "axios";
import { AxiosInterceptor } from "../types/axios.types";

export interface AuthInterceptorOptions {
  /**
   * Called when an authentication failure occurs.
   *
   * Responsible for refreshing credentials.
   */
  onUnauthorized(error: AxiosError, request: AxiosRequestConfig): Promise<void>;
}

export function authInterceptor({
  onUnauthorized,
}: AuthInterceptorOptions): AxiosInterceptor {
  return (client) => {
    client.interceptors.response.use(
      (response) => response,

      async (error: AxiosError) => {
        const request = error.config;

        if (error.response?.status === 401 && request) {
          await onUnauthorized(error, request);

          return client(request);
        }

        return Promise.reject(error);
      },
    );
  };
}
