import { Module } from '@nestjs/common'
import { AuthenticationModule } from '@/modules/authentication/authentication.module'
import { REALTIME_PUBLISHER } from './application/ports/realtime-publisher.port'
import { RealtimeGateway } from './infrastructure/realtime.gateway'
import { SocketAuthenticator } from './infrastructure/socket-authenticator.service'
import { SocketRealtimePublisher } from './infrastructure/socket-realtime.publisher'

/**
 * Composition root for Orbit's shared realtime infrastructure.
 *
 * - Uses existing access-token and Redis session authentication.
 * - Exports only the application publisher abstraction.
 */
@Module({
  imports: [AuthenticationModule],
  providers: [
    SocketAuthenticator,
    RealtimeGateway,
    {
      provide: REALTIME_PUBLISHER,
      useClass: SocketRealtimePublisher,
    },
  ],
  exports: [REALTIME_PUBLISHER],
})
export class RealtimeModule {}
