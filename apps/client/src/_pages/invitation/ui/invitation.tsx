import { InvitationCard } from '@/features/invitation'
import { API_ROUTES } from '@/shared/api/routes/api.routes'
import { serverFetch } from '@/shared/lib/http/server-fetch'
import InvitationPage from './invitation-page'

interface GetInvitationResponseData {
  workspaceName: string
  workspaceSlug: string
  workspaceLogoUrl: string | null
  inviterName: string
  roleName: string
  expiresAt: string
  action: 'SIGN_IN' | 'SIGN_UP'
}

const Invitation = async ({ token }: { token: string }) => {
  const res = await serverFetch<GetInvitationResponseData>(
    API_ROUTES.WORKSPACES.GET_INVITATION(token)
  )

  if (!res.success)
    return <div className="">Something went wrong {res.message}</div>

  return (
    <div className="size-full flex justify-center items-center">
      <InvitationPage invitation={res.data} token={token} />
    </div>
  )
}

export default Invitation
