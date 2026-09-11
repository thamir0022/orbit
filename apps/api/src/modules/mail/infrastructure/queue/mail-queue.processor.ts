import { Processor, WorkerHost } from '@nestjs/bullmq'
import { Logger } from '@nestjs/common'
import { Job } from 'bullmq'

import { MailSenderAdapter } from '../adapters/mail-sender.adapter'

import {
  JOB_EMAIL_VERIFICATION,
  JOB_FORGOT_PASSWORD,
  MAIL_QUEUE_NAME,
  WORKSPACE_INVITATION,
} from './mail-queue.producer'

interface ForgotPasswordPayload {
  to: string
  otp: string
}

interface EmailVerificationPayload {
  to: string
  otp: string
}

interface WorkspaceInvitationPayload {
  to: string
  inviterName: string
  workspaceName: string
  roleName: string
  invitationUrl: string
  expiresInDays: number
}

type MailJobPayload =
  | ForgotPasswordPayload
  | EmailVerificationPayload
  | WorkspaceInvitationPayload

@Processor(MAIL_QUEUE_NAME)
export class MailQueueProcessor extends WorkerHost {
  private readonly logger = new Logger(MailQueueProcessor.name)

  constructor(private readonly mailSender: MailSenderAdapter) {
    super()
  }

  async process(job: Job<MailJobPayload>): Promise<void> {
    this.logger.log(`Processing job ${job.name} (ID: ${job.id})`)

    switch (job.name) {
      case JOB_FORGOT_PASSWORD: {
        const { to, otp } = job.data as ForgotPasswordPayload

        await this.mailSender.sendForgotPassword(to, otp)
        break
      }

      case JOB_EMAIL_VERIFICATION: {
        const { to, otp } = job.data as EmailVerificationPayload

        await this.mailSender.sendEmailVerification(to, otp)
        break
      }

      case WORKSPACE_INVITATION: {
        const {
          to,
          inviterName,
          workspaceName,
          roleName,
          invitationUrl,
          expiresInDays,
        } = job.data as WorkspaceInvitationPayload

        await this.mailSender.sendWorkspaceInvitation(to, {
          inviterName,
          workspaceName,
          roleName,
          invitationUrl,
          expiresInDays,
        })

        break
      }

      default:
        this.logger.warn(`Unknown job type: ${job.name}`)
    }
  }
}
