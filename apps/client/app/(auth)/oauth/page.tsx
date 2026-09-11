'use client'

import { loginWithProvider } from '@/features/auth/hooks/use-oauth'
import { Button } from '@/shared/ui/button'
import { Metadata } from 'next'
import { useSearchParams } from 'next/navigation'

export const metadata: Metadata = {
  title: 'OAuth | Orbit',
  description: 'OAuth authentication',
}

const OAuth = () => {
  const searchParams = useSearchParams()
  const success = searchParams.get('success') === 'true'
  const error = searchParams.get('error')
  const provider = searchParams.get('provider')

  return (
    <div className="w-full md:w-1/2 px-10 flex flex-col items-center justify-center gap-5">
      {!success && error && (
        <p className="md:text-xl text-center">
          {error === 'access_denied'
            ? "It looks like you cancelled the authentication process. Try signing in again when you're ready."
            : error === 'no_code' &&
              "We couldn't complete your authentication request. Please try again."}
        </p>
      )}

      <Button
        onClick={() => loginWithProvider(provider as 'google' | 'github')}
      >
        Try again
      </Button>
    </div>
  )
}

export default OAuth
