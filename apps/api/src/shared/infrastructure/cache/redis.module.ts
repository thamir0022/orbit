import { Global, Module } from '@nestjs/common'
import { CacheModule } from '@nestjs/cache-manager'
import { createKeyv, Keyv } from '@keyv/redis'
import { KeyvCacheableMemory } from 'cacheable'
import {
  type IRedisConfig,
  REDIS_CONFIG,
} from '../interfaces/redis.config.interface'

@Global()
@Module({
  imports: [
    CacheModule.registerAsync({
      inject: [REDIS_CONFIG],
      useFactory: (config: IRedisConfig) => {
        return {
          stores: [
            new Keyv({
              store: new KeyvCacheableMemory({ ttl: 60000, lruSize: 5000 }),
            }),
            createKeyv(config.redisUri),
          ],
        }
      },
    }),
  ],
  exports: [CacheModule],
})
export class RedisModule {}
