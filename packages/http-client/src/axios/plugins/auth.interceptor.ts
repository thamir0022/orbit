import type {
  AxiosError,
  AxiosInstance,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";

export interface UnauthorizedContext {
  error: AxiosError;
  client: AxiosInstance;
}

export interface AuthInterceptorOptions {
  onUnauthorized?: (context: UnauthorizedContext) => Promise<AxiosResponse>;
}

export interface AuthAxiosRequestConfig extends InternalAxiosRequestConfig {
  skipAuthHandling?: boolean;
  _authRetry?: boolean;
}

export type AxiosInterceptor = (client: AxiosInstance) => void;

export const authInterceptor = (
  options: AuthInterceptorOptions = {},
): AxiosInterceptor => {
  const { onUnauthorized } = options;

  return (client: AxiosInstance) => {
    client.interceptors.response.use(
      (response) => response,

      async (error: AxiosError) => {
        const config = error.config as AuthAxiosRequestConfig | undefined;

        const isUnauthorized = error.response?.status === 401;

        const shouldHandleUnauthorized =
          isUnauthorized &&
          !config?.skipAuthHandling &&
          !config?._authRetry &&
          onUnauthorized;

        if (!shouldHandleUnauthorized) {
          return Promise.reject(error);
        }
        return onUnauthorized({
          error,
          client,
        });
      },
    );
  };
};
