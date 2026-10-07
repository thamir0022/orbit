import { redirect } from 'next/navigation'

export default async function DocsPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  redirect(`/${slug}/docs/new`)
}
