export interface IRedisConfig {
  redisUri: string
  sessionTTL: number
  otpTTL: number
  permissionTTL: number
  otpResetTokenTTL: number
  signUpSessionTTL: number
  otpResendCooldownTTL: number
  otpResendAttemptsTTL: number
  maxOtpPerDay: number
}

export const REDIS_CONFIG = Symbol('IRedisConfig')
