import type { HttpMethod, HttpRequestConfig } from "../types";

/**
 * Internal request object used by HttpClient.
 *
 * This type is intentionally NOT exported from the package.
 * It represents the normalized request passed through the
 * client's internal request pipeline.
 */
export interface InternalHttpRequest {
  /**
   * HTTP method.
   */
  method: HttpMethod;

  /**
   * Relative request URL.
   *
   * Example:
   * /workspaces
   * /users/123
   */
  url: string;

  /**
   * Optional request body.
   */
  body?: unknown;

  /**
   * Request configuration.
   */
  config?: HttpRequestConfig;
}
