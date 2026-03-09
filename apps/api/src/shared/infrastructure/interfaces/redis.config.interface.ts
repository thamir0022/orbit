export interface IRedisConfig {
  redisUri: string
  sessionTTL: number
  otpTTL: number
  otpResetTokenTTL: number
  signUpSessionTTL: number
}

export const REDIS_CONFIG = Symbol('IRedisConfig')
