import { Injectable, Logger } from '@nestjs/common'
import { InjectQueue } from '@nestjs/bullmq'
import { Queue } from 'bullmq'
import { IMailService } from '../../domain/ports/mail-service.port'

export const MAIL_QUEUE_NAME = 'mail-queue'
export const JOB_FORGOT_PASSWORD = 'forgot-password'
export const JOB_EMAIL_VERIFICATION = 'email-verification'

@Injectable()
export class MailQueueProducer implements IMailService {
  private readonly logger = new Logger(MailQueueProducer.name)

  constructor(
    @InjectQueue(MAIL_QUEUE_NAME) private readonly mailQueue: Queue
  ) {}

  async sendForgotPasswordEmail(to: string, otp: string): Promise<void> {
    try {
      // We add a job to the queue.
      // 'attempts': retries if Mailtrap fails temporarily.
      // 'backoff': waits before retrying.
      await this.mailQueue.add(
        JOB_FORGOT_PASSWORD,
        { to, otp },
        {
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 1000,
          },
          removeOnComplete: true, // Keep Redis clean
        }
      )
      this.logger.log(`Queued forgot-password email for ${to}`)
    } catch (error) {
      this.logger.error(
        `Failed to queue email for ${to}`,
        error instanceof Error ? error?.stack : ''
      )
      // In production, you might want to throw a Domain Exception or alert via monitoring
    }
  }

  async sendEmailVerificationEmail(to: string, otp: string): Promise<void> {
    try {
      await this.mailQueue.add(
        JOB_EMAIL_VERIFICATION,
        { to, otp },
        {
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 1000,
          },
          removeOnComplete: true, // Keep Redis clean
        }
      )
      this.logger.log(`Queued email verification email for ${to}`)
    } catch (error) {
      this.logger.error(
        `Failed to queue email for ${to}`,
        error instanceof Error ? error?.stack : ''
      )
    }
  }
}
