import { ResetPasswordPage } from '@/_pages/auth/password-reset'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Reset Your Password | Orbit',
  description: 'Reset your Orbit password'
}

export default function ResetPassword() {
  return <ResetPasswordPage />
}
