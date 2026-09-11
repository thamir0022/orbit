'use client'

import { useSignUpStore } from '@/features/auth/sign-up/model/sign-up.store'
import { InvitationCard } from '@/features/invitation'
import { useRouter } from 'next/navigation'

interface Invitation {
  workspaceName: string
  workspaceSlug: string
  workspaceLogoUrl: string | null
  inviterName: string
  roleName: string
  expiresAt: string
  action: 'SIGN_IN' | 'SIGN_UP'
}

const InvitationPage = ({
  invitation,
  token,
}: {
  invitation: Invitation
  token: string
}) => {
  const router = useRouter()
  const { setInvitationToken } = useSignUpStore()

  const handleContinue = () => {
    if (invitation.action === 'SIGN_IN') return router.push('/sign-in')
    if (invitation.action === 'SIGN_UP') {
      setInvitationToken(token)
      return router.push('/sign-up')
    }
  }

  return (
    <InvitationCard
      invitation={invitation}
      onContinue={handleContinue}
      onDecline={() => router.push('/sign-up')}
    />
  )
}

export default InvitationPage
