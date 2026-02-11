import {
  IsEnum,
  IsInt,
  IsString,
  IsUrl,
  Max,
  Min,
  IsDefined,
  IsNotEmpty,
} from 'class-validator'
import { Transform, Type } from 'class-transformer'

export enum Environment {
  DEVELOPMENT = 'development',
  PRODUCTION = 'production',
  TEST = 'test',
}

export class EnvironmentVariables {
  @IsEnum(Environment)
  NODE_ENV: Environment = Environment.DEVELOPMENT

  @IsDefined()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(65535)
  PORT: number

  @IsDefined()
  @IsString()
  @IsNotEmpty()
  CORS_ORIGINS: string

  @IsDefined()
  @IsString()
  @IsNotEmpty()
  MONGODB_URI: string

  @IsDefined()
  @IsString()
  @IsNotEmpty()
  MONGODB_DB_NAME: string

  @IsDefined()
  @IsString()
  @IsNotEmpty()
  REDIS_URI: string

  @IsDefined()
  @Type(() => Number)
  @IsInt()
  @Min(60 * 60 * 24 * 1000) // 1 day (ms)
  @Max(60 * 60 * 24 * 30 * 1000) // 30 days (ms)
  SESSION_TTL: number

  // JWT
  @IsDefined()
  @IsString()
  @IsNotEmpty()
  JWT_ACCESS_SECRET: string

  @IsDefined()
  @IsString()
  @IsNotEmpty()
  JWT_REFRESH_SECRET: string

  @IsDefined()
  @Type(() => Number)
  @IsInt()
  @Min(60) // 1 minute
  @Max(60 * 60 * 24) // 1 day (seconds)
  JWT_ACCESS_TOKEN_EXPIRES_IN: number

  @IsDefined()
  @Type(() => Number)
  @IsInt()
  @Min(60)
  @Max(60 * 60 * 24 * 30) // 30 days (seconds)
  JWT_REFRESH_TOKEN_EXPIRES_IN: number

  // Google OAuth
  @IsDefined()
  @IsString()
  @IsNotEmpty()
  GOOGLE_CLIENT_ID: string

  @IsDefined()
  @IsString()
  @IsNotEmpty()
  GOOGLE_CLIENT_SECRET: string

  @IsDefined()
  @Transform(({ value }: { value: string }) => value?.trim())
  @IsUrl({ require_protocol: true, require_tld: false })
  GOOGLE_CALLBACK_URL: string

  @IsDefined()
  @Transform(({ value }: { value: string }) => value?.trim())
  @IsUrl({ require_protocol: true, require_tld: false })
  FRONTEND_URL: string
}
