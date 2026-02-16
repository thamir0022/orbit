export interface IAppConfig {
  nodeEnv: string
  port: number
  corsOrigins: string
  frontEndUrl: string
}

export const APP_CONFIG = Symbol('IAppConfig')
