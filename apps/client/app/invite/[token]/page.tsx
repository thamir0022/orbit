import Invitation from '@/_pages/invitation/ui/invitation'

const InvitationPage = async ({
  params,
}: {
  params: Promise<{ token: string }>
}) => {
  const { token } = await params

  return <Invitation token={token} />
}

export default InvitationPage
