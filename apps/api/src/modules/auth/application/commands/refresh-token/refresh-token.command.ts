export class RefreshTokenCommand {
  constructor(
    public readonly _refreshToken: string,
    public readonly _ipAddress: string,
    public readonly _userAgent: string
  ) {}
}
