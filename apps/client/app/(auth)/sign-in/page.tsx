import { SignInPage } from '@/_pages/auth/sign-in'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sign In | Orbit',
  description: 'Sign In to Orbit'
}

export default function SignIn() {
  return <SignInPage />
}
