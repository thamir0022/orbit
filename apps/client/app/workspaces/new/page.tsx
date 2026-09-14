import { CreateWorkspacePage } from '@/_pages/workspaces/create-workspace'

type PageProps = { searchParams: Promise<{ isNewUser: 'true' | 'false' }> }

const Page = async ({ searchParams }: PageProps) => {
  const { isNewUser } = await searchParams

  return <CreateWorkspacePage isNewuser={isNewUser === 'true'} />
}

export default Page
