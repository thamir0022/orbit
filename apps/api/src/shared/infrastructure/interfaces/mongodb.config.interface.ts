export interface IMongoConfig {
  mongoDbURI: string
  mongoDbName: string
}

export const MONGODB_CONFIG = Symbol('IMongoConfig')
