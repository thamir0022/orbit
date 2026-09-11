import { plainToInstance } from 'class-transformer'
import { validateSync } from 'class-validator'
import { EnvironmentVariables } from './env.validation'

/**
 * Validate and transform a plain configuration object into an EnvironmentVariables instance.
 *
 * @param config - Plain object of configuration values (e.g., process.env) to validate and convert
 * @returns The validated `EnvironmentVariables` instance
 * @throws Error - if validation fails; the error message contains the validation errors
 */
export function validate(config: Record<string, unknown>) {
  // 1. Transform plain JSON (process.env) to Class Instance
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  })

  // 2. Validate the Class Instance
  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  })

  if (errors.length > 0) {
    throw new Error(errors.toString())
  }
  return validatedConfig
}
