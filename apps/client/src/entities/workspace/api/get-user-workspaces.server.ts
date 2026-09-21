import { serverFetch } from '@/shared/lib/http/server-fetch' // Adjust path to your serverFetch

export interface WorkspaceListItem {
  name: string
  slug: string
  logoUrl?: string
}

export interface GetUserWorkspacesData {
  workspaces: WorkspaceListItem[]
}

/**
 * Executes securely on the Next.js Node server.
 * serverFetch automatically injects the identity_token from cookies.
 */
export async function getUserWorkspacesServer(): Promise<GetUserWorkspacesData> {
  // Assuming your serverFetch base URL is already configured to include /api/v1
  const payload = await serverFetch<GetUserWorkspacesData>('/workspaces')

  if (!payload.success) {
    throw new Error(
      payload.error?.message || payload.message || 'Failed to load workspaces'
    )
  }

  return payload.data
}
