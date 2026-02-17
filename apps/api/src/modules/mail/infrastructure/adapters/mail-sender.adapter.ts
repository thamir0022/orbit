import { Inject, Injectable, Logger } from '@nestjs/common'
import nodemailer, { type Transporter } from 'nodemailer'
import { getForgotPasswordTemplate } from '../templates/forgot-password.template'
import { MAIL_CONFIG, type IMailConfig } from '../config/mail.config.interface'

@Injectable()
export class MailSenderAdapter {
  private transporter: Transporter
  private readonly logger = new Logger(MailSenderAdapter.name)

  constructor(
    @Inject(MAIL_CONFIG)
    private readonly _config: IMailConfig
  ) {
    // Mailtrap Configuration
    this.transporter = nodemailer.createTransport({
      host: this._config.mailHost, // e.g., sandbox.smtp.mailtrap.io
      port: this._config.mailPort, // e.g., 2525
      auth: {
        user: this._config.mailUser,
        pass: this._config.mailPass,
      },
    })
  }

  async sendForgotPassword(to: string, otp: string): Promise<void> {
    const html = getForgotPasswordTemplate(otp)

    await this.transporter.sendMail({
      from: `"${this._config.mailFromName}" <${this._config.mailFromEmail}>`,
      to,
      subject: 'Reset your Orbit Password',
      html,
    })

    this.logger.log(`Email actually sent via Mailtrap to ${to}`)
  }
}
