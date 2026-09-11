import { AxiosError, isAxiosError } from "axios";

import { ApiError, ApiErrorType } from "./api-error";
import type { ApiFailure } from "../types";

/**
 * Converts any unknown error into an ApiError.
 *
 * This function never returns.
 */
export function normalizeError(error: unknown): never {
  /**
   * Already normalized.
   */
  if (error instanceof ApiError) {
    throw error;
  }

  /**
   * Unexpected runtime error.
   */
  if (!isAxiosError(error)) {
    throw new ApiError({
      type: ApiErrorType.UNKNOWN,
      message: "An unexpected application error occurred.",
      cause: error,
    });
  }

  /**
   * Request cancelled by the caller.
   */
  if (error.code === AxiosError.ERR_CANCELED) {
    throw new ApiError({
      type: ApiErrorType.CANCELED,
      message: "The request was cancelled.",
      cause: error,
    });
  }

  /**
   * Request timeout.
   */
  if (error.code === AxiosError.ECONNABORTED || error.code === "ETIMEDOUT") {
    throw new ApiError({
      type: ApiErrorType.TIMEOUT,
      message: "The request timed out. Please try again.",
      cause: error,
    });
  }

  /**
   * Network / DNS / CORS / Server unavailable.
   */
  if (!error.response) {
    throw new ApiError({
      type: ApiErrorType.NETWORK,
      message:
        "Unable to connect to the server. Please check your internet connection and try again.",
      cause: error,
    });
  }

  /**
   * Invalid backend response.
   */
  if (!error.response.data) {
    throw new ApiError({
      type: ApiErrorType.UNKNOWN,
      message: "The server returned an invalid response.",
      statusCode: error.response.status,
      cause: error,
    });
  }

  /**
   * Normalize backend error response.
   */
  const response = error.response.data as ApiFailure;

  throw ApiError.fromResponse(response);
}
