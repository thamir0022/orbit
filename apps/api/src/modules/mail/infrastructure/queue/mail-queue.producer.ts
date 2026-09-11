import { Injectable, Logger } from '@nestjs/common'
import { InjectQueue } from '@nestjs/bullmq'
import { Queue } from 'bullmq'
import {
  IMailService,
  WorkspaceInvitationEmailPayload,
} from '../../domain/ports/mail-service.port'

export const MAIL_QUEUE_NAME = 'mail-queue'
export const JOB_FORGOT_PASSWORD = 'reset-password'
export const JOB_EMAIL_VERIFICATION = 'email-verification'
export const WORKSPACE_INVITATION = 'workspace-invitation'

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
        this.defaultJobOptions
      )
      this.logger.log(`Queued reset-password email for ${to}`)
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
        this.defaultJobOptions
      )
      this.logger.log(`Queued email verification email for ${to}`)
    } catch (error) {
      this.logger.error(
        `Failed to queue email for ${to}`,
        error instanceof Error ? error?.stack : ''
      )
    }
  }

  async sendWorkspaceInvitationEmail(
    to: string,
    payload: WorkspaceInvitationEmailPayload
  ): Promise<void> {
    try {
      await this.mailQueue.add(
        WORKSPACE_INVITATION,
        {
          to,
          ...payload,
        },
        this.defaultJobOptions
      )

      this.logger.log(`Queued workspace invitation email for ${to}`)
    } catch (error) {
      this.logger.error(
        `Failed to queue workspace invitation email for ${to}`,
        error instanceof Error ? error.stack : ''
      )
    }
  }

  private readonly defaultJobOptions = {
    attempts: 3,
    backoff: {
      type: 'exponential' as const,
      delay: 1000,
    },
    removeOnComplete: true,
  }
}
