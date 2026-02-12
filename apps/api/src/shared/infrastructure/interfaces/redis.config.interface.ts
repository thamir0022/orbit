export interface IRedisConfig {
  redisUri: string
  sessionTTL: number
  otpTTL: number
  otpResetTokenTTL: number
}

export const REDIS_CONFIG = Symbol('IRedisConfig')
