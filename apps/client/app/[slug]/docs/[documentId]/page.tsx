import { DocumentPage } from '@/_pages/document'

export default async function Page({
  params,
}: {
  params: Promise<{ documentId: string }>
}) {
  const { documentId } = await params

  return <DocumentPage documentId={documentId} />
}
