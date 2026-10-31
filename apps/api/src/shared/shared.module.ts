import { Global, Module } from '@nestjs/common'
import { TransactionManager } from './infrastructure/database/transaction-manager'
import { TRANSACTION_MANAGER } from './application'
import { APPLICATION_EVENT_PUBLISHER } from './application/events/application-event-publisher.port'
import { NestApplicationEventPublisher } from './infrastructure/events/nest-application-event.publisher'

@Global()
@Module({
  providers: [
    {
      provide: TRANSACTION_MANAGER,
      useClass: TransactionManager,
    },
    {
      provide: APPLICATION_EVENT_PUBLISHER,
      useClass: NestApplicationEventPublisher,
    },
  ],
  exports: [TRANSACTION_MANAGER, APPLICATION_EVENT_PUBLISHER],
})
export class SharedModule {}
