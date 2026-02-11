export interface IAppConfig {
  nodeEnv: string
  port: number
  corsOrgins: string
}

export const APP_CONFIG = Symbol('IAppConfig')
