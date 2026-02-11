export interface IRedisConfig {
  redisUri: string
  sessionTTL: number
}

export const REDIS_CONFIG = Symbol('IRedisConfig')
