import { Processor, WorkerHost } from '@nestjs/bullmq'
import { Job } from 'bullmq'
import { Logger } from '@nestjs/common'
import { MailSenderAdapter } from '../adapters/mail-sender.adapter'
import { MAIL_QUEUE_NAME, JOB_FORGOT_PASSWORD } from './mail-queue.producer'

// 1. Interface for the payload
interface IForgotPasswordPayload {
  to: string
  otp: string
}

@Processor(MAIL_QUEUE_NAME)
export class MailQueueProcessor extends WorkerHost {
  private readonly logger = new Logger(MailQueueProcessor.name)

  constructor(private readonly mailSender: MailSenderAdapter) {
    super()
  }

  // 2. Use 'unknown' instead of 'any' to force explicit casting/checking
  async process(job: Job<IForgotPasswordPayload>): Promise<void> {
    this.logger.log(`Processing job ${job.name} (ID: ${job.id})`)

    switch (job.name) {
      case JOB_FORGOT_PASSWORD: {
        // 3. Fix Lexical Declaration: Added { } block wrapper

        // 4. Fix Unsafe Assignment: Cast data to the Interface
        const { to, otp } = job.data

        await this.mailSender.sendForgotPassword(to, otp)
        break
      }

      default:
        this.logger.warn(`Unknown job type: ${job.name}`)
    }
  }
}
