'use client'
import Link from 'next/link'
import { useTeamRoute } from '@/widgets/team-route'
export function StoryLink({
  storyKey,
  title,
}: {
  storyKey: string
  title: string
}) {
  const { workspaceSlug, teamKey } = useTeamRoute()
  return (
    <Link
      className="block w-full min-w-0 break-words rounded-sm font-medium leading-5 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      href={
        '/' +
        workspaceSlug +
        '/teams/' +
        teamKey +
        '/stories/' +
        encodeURIComponent(storyKey)
      }
    >
      {title}
    </Link>
  )
}
