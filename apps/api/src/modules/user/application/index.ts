/**
 * APPLICATION LAYER - Use Cases & Orchestration
 *
 * This layer orchestrates the flow of data between the outside world
 * and the domain layer. It contains:
 *
 * - Ports (Interfaces)
 *   - Repository interfaces - Define persistence contracts
 *   - Service interfaces - Define external service contracts
 *
 * - Use Cases (Commands/Queries)
 *   - Command Handlers - Write operations (SignUp, SignIn)
 *   - Query Handlers - Read operations (GetUser)
 *
 * - DTOs - Data Transfer Objects for input/output
 * - Mappers - Transform between layers (Domain <-> DTO <-> Persistence)
 * - Event Handlers - React to domain events
 *
 * Depends on: Domain Layer only
 * Does NOT depend on: Infrastructure, Presentation
 */

// Ports
export * from './ports'

// Commands
export * from './commands/sign-up/sign-up.command'
export * from './commands/sign-up/sign-up.handler'
export * from './commands/sign-in/sign-in.command'
export * from './commands/sign-in/sign-in.handler'

// DTOs
export * from './dtos/user-response.dto'

// Mappers
export * from './mappers/user.mapper'

// Event Handlers
export * from './event-handlers/user-created.handler'
export * from './event-handlers/user-sign-in.handler'
