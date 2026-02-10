export interface ClientInfo {
  ipAddress: string
  userAgent: string
}

export interface SignInCommand {
  email: string
  password: string
  clientInfo: ClientInfo
}
