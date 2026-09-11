/**
 * Supported HTTP methods.
 *
 * The package internally maps these methods to the underlying
 * transport implementation (Axios).
 */
export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

/**
 * Primitive query parameter values.
 */
export type HttpQueryValue =
  | string
  | number
  | boolean
  | null
  | undefined
  | Date;

/**
 * Query string parameters.
 *
 * Example:
 *
 * {
 *   page: 1,
 *   search: 'john',
 *   active: true,
 * }
 */
export type HttpQueryParams = Record<string, HttpQueryValue | HttpQueryValue[]>;

/**
 * Additional request headers.
 */
export type HttpHeaders = Record<string, string>;

/**
 * Transport-agnostic request configuration.
 *
 * This intentionally exposes only the options that are commonly
 * required by the application.
 *
 * Axios-specific implementation details remain internal to
 * the http-client package.
 */
export interface HttpRequestConfig {
  /**
   * Query string parameters.
   */
  params?: HttpQueryParams;

  /**
   * Custom request headers.
   */
  headers?: HttpHeaders;

  /**
   * Request timeout in milliseconds.
   *
   * Overrides the default client timeout.
   */
  timeout?: number;

  /**
   * Override credential behavior for this request.
   */
  withCredentials?: boolean;

  /**
   * Optional AbortSignal.
   *
   * Works with Axios v1+ and Fetch.
   */
  signal?: AbortSignal;
}
