import type { ApiFailure } from "../types";

export enum ApiErrorType {
  CLIENT = "CLIENT",
  SERVER = "SERVER",
  NETWORK = "NETWORK",
  TIMEOUT = "TIMEOUT",
  CANCELED = "CANCELED",
  UNKNOWN = "UNKNOWN",
}

interface ApiErrorOptions {
  type: ApiErrorType;
  message: string;
  statusCode?: number;
  path?: string;
  timestamp?: string;
  cause?: unknown;
}

export class ApiError extends Error {
  readonly type: ApiErrorType;

  readonly statusCode?: number;

  readonly path?: string;

  readonly timestamp?: string;

  override readonly cause?: unknown;

  constructor({
    type,
    message,
    statusCode,
    path,
    timestamp,
    cause,
  }: ApiErrorOptions) {
    super(message);

    this.name = "ApiError";

    this.type = type;
    this.statusCode = statusCode;
    this.path = path;
    this.timestamp = timestamp;
    this.cause = cause;

    Object.setPrototypeOf(this, ApiError.prototype);
  }

  static fromResponse(response: ApiFailure): ApiError {
    return new ApiError({
      type:
        response.statusCode >= 500
          ? ApiErrorType.SERVER
          : ApiErrorType.CLIENT,

      message: response.message,

      statusCode: response.statusCode,

      path: response.path,

      timestamp: response.timestamp,
    });
  }

  get isOperational() {
    return (
      this.type === ApiErrorType.CLIENT ||
      this.type === ApiErrorType.NETWORK ||
      this.type === ApiErrorType.TIMEOUT ||
      this.type === ApiErrorType.CANCELED
    );
  }

  get isServerError() {
    return this.type === ApiErrorType.SERVER;
  }

  get isValidationError() {
    return this.statusCode === 422;
  }

  get isUnauthorized() {
    return this.statusCode === 401;
  }

  get isForbidden() {
    return this.statusCode === 403;
  }

  get isNotFound() {
    return this.statusCode === 404;
  }

  get isConflict() {
    return this.statusCode === 409;
  }
}