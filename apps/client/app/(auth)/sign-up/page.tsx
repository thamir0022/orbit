import { SignUpPage } from '@/_pages/auth/sign-up'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sign Up | Orbit',
  description: 'Sign Up to Orbit',
}

export default function SignUp() {
  return <SignUpPage />
}
