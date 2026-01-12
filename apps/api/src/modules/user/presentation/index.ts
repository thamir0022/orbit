/**
 * PRESENTATION LAYER - HTTP Interface
 *
 * This layer handles HTTP requests and responses.
 * It's the entry point for external clients.
 *
 * Contains:
 * - Controllers - Handle HTTP routes and methods
 * - DTOs - Request/Response validation and serialization
 *
 * Responsibilities:
 * - Parse and validate incoming requests
 * - Transform domain results to HTTP responses
 * - Handle HTTP-specific concerns (status codes, headers)
 *
 * Depends on: Application Layer (for Commands/Queries)
 */

// Controllers
export * from './controllers/user.controller'

// DTOs
export * from './dtos/sign-up.request.dto'
export * from './dtos/sign-up.response.dto'
