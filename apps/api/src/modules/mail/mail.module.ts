import { Module, Global } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { BullModule } from '@nestjs/bullmq'
import { MAIL_SERVICE } from './domain/ports/mail-service.port'
import {
  MailQueueProducer,
  MAIL_QUEUE_NAME,
} from './infrastructure/queue/mail-queue.producer'
import { MailQueueProcessor } from './infrastructure/queue/mail-queue.processor'
import { MailSenderAdapter } from './infrastructure/adapters/mail-sender.adapter'
import { REDIS_CONFIG } from '@/shared/infrastructure'
import { IMailConfig } from './infrastructure/config/mail.config.interface'

@Global()
@Module({
  imports: [
    // 1. Configure BullMQ Root (Connection to Redis)
    BullModule.forRootAsync({
      inject: [REDIS_CONFIG],
      useFactory: (config: IMailConfig) => ({
        connection: {
          url: config.redisUri,
        },
      }),
    }),
    // 2. Register the specific queue
    BullModule.registerQueue({
      name: MAIL_QUEUE_NAME,
    }),
    ConfigModule,
  ],
  providers: [
    // The implementation of the public interface is now the Producer
    {
      provide: MAIL_SERVICE,
      useClass: MailQueueProducer,
    },
    // The background worker
    MailQueueProcessor,
    // The actual email sender logic
    MailSenderAdapter,
  ],
  exports: [MAIL_SERVICE], // Export only the interface token
})
export class MailModule {}
