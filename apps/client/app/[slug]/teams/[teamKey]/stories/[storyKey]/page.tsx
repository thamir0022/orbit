import { StoryOverviewPage } from '@/_pages/story-overview/ui/story-overview-page'
export default async function Page({
  params,
}: {
  params: Promise<{ storyKey: string }>
}) {
  const { storyKey } = await params
  return <StoryOverviewPage storyKey={storyKey} />
}
