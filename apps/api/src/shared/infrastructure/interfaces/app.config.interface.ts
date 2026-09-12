export interface IAppConfig {
  nodeEnv: string
  isProduction: boolean
  port: number
  corsOrigins: string[]
  frontEndUrl: string
  observeAppKey: string
  observeAppSecret: string
}

export const APP_CONFIG = Symbol('IAppConfig')
