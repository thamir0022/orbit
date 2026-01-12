/**
 * Application Ports Index
 *
 * Ports define the contracts (interfaces) that the application layer
 * needs from external systems. These are implemented by Adapters
 * in the Infrastructure layer.
 *
 * This follows the Ports & Adapters (Hexagonal) architecture pattern:
 * - Ports = Interfaces (defined here in Application layer)
 * - Adapters = Implementations (in Infrastructure layer)
 */

// Repository Ports
export * from './repository/user.repository.interface';

// Service Ports
export * from './services/password-hasher.interface';
export * from './services/session-manager.interface';
export * from './services/token-generator.interface';
