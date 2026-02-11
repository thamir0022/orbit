import { Module, Global } from '@nestjs/common'
import { CacheModule } from '@nestjs/cache-manager'
import KeyvRedis from '@keyv/redis'
import { Keyv } from 'keyv'
import { CacheableMemory } from 'cacheable'
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
              store: new CacheableMemory({ ttl: 60000, lruSize: 5000 }),
            }),
            new KeyvRedis(config.redisUri),
          ],
        }
      },
    }),
  ],
  exports: [CacheModule],
})
export class RedisModule {}
