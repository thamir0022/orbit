import type { AxiosError, AxiosResponse } from "axios";
import { AxiosInterceptor } from "../types/axios.types";

export interface LoggingInterceptorOptions {
  /**
   * Enable request logging.
   *
   * @default true
   */
  logRequests?: boolean;

  /**
   * Enable response logging.
   *
   * @default true
   */
  logResponses?: boolean;

  /**
   * Enable error logging.
   *
   * @default true
   */
  logErrors?: boolean;
}

/**
 * Registers request/response logging.
 *
 * Intended for development.
 */
export function loggingInterceptor({
  logRequests = true,
  logResponses = true,
  logErrors = true,
}: LoggingInterceptorOptions = {}): AxiosInterceptor {
  return (client) => {
    client.interceptors.request.use((config) => {
      if (logRequests) {
        console.info(
          `[HTTP] ${config.method?.toUpperCase()} ${config.url}`,
          config,
        );
      }

      return config;
    });

    client.interceptors.response.use(
      (response: AxiosResponse) => {
        if (logResponses) {
          console.info(
            `[HTTP ${response.status}] ${response.config.url}`,
            response.data,
          );
        }

        return response;
      },
      (error: AxiosError) => {
        if (logErrors) {
          console.error(
            `[HTTP ERROR ${error.response?.status ?? "NETWORK"}]`,
            error,
          );
        }

        return Promise.reject(error);
      },
    );
  };
}
