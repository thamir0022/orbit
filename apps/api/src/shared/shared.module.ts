import { Global, Module } from '@nestjs/common'
import { TransactionManager } from './infrastructure/database/transaction-manager'
import { TRANSACTION_MANAGER } from './application'

@Global()
@Module({
  providers: [
    {
      provide: TRANSACTION_MANAGER,
      useClass: TransactionManager,
    },
  ],
  exports: [TRANSACTION_MANAGER],
})
export class SharedModule {}
