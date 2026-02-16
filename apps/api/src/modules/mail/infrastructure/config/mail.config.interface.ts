export interface IMailConfig {
  mailHost: string
  mailPort: number
  mailUser: string
  mailPass: string
  mailFromName: string
  mailFromEmail: string
  redisUri: string
}

export const MAIL_CONFIG = Symbol('IMailConfig')
