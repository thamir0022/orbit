export interface IAppConfig {
  nodeEnv: string
  port: number
  corsOrigins: string
}

export const APP_CONFIG = Symbol('IAppConfig')
