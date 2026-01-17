/**
 * Sign Up Command
 * Represents the intent to register a new user
 */

export class SignUpCommand {
  constructor(
    public readonly firstName: string,
    public readonly lastName: string,
    public readonly email: string,
    public readonly password: string,
    public readonly ipAddress: string,
    public readonly userAgent: string
  ) {}
}
