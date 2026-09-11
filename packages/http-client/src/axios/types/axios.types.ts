import { AxiosInstance } from "axios";

export interface AxiosOptions {
  /**
   * API base URL.
   */
  baseURL: string;

  /**
   * Whether browser credentials should be sent.
   *
   * @default true
   */
  withCredentials?: boolean;

  /**
   * Default timeout.
   *
   * @default 30000
   */
  timeout?: number;

  /**
   * Default headers.
   */
  headers?: Record<string, string>;
}

/**
 * Function capable of configuring an Axios instance.
 */
export type AxiosInterceptor = (client: AxiosInstance) => void;
