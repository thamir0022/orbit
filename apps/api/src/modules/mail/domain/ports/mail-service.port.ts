export interface IMailService {
  sendForgotPasswordEmail(to: string, otp: string): Promise<void>
}

export const MAIL_SERVICE = Symbol('MAIL_SERVICE')
