import { useMutation, useQueryClient } from '@tanstack/react-query'
import { isAxiosError } from 'axios'
import { toast } from 'sonner'
import { useRouter, useSearchParams } from 'next/navigation'
import { signInApi } from './sign-in.api'
import { getUserWorkspacesApi } from '@/entities/workspace/api/ger-user-workspaces.api'
import type { SignInFormData } from '../model/sign-in.schema'
import type { ApiResponse } from '@/shared/api/api.types'

export function useSignInMutation() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const redirectUrl = searchParams.get('redirecturl')

  // 1. Initialize the query client
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: SignInFormData) => signInApi(data),

    // 2. Make the onSuccess callback async
    onSuccess: async (data) => {
      if (data.success) {
        toast.success(data.message)

        try {
          // 3. Fetch the workspaces and cache them globally
          const workspaceResponse = await queryClient.query({
            queryKey: ['workspaces'],
            queryFn: getUserWorkspacesApi,
            // Stale time ensures it doesn't refetch immediately on the next page
            staleTime: 1000 * 60 * 5,
          })

          const workspaces = workspaceResponse.data.workspaces

          // 4. Handle the routing logic based on the user's workspace state
          if (workspaces && workspaces.length > 0) {
            const url =
              workspaces.length === 1
                ? `/${workspaces[0].slug}/overview`
                : redirectUrl
                  ? redirectUrl
                  : '/workspaces'

            router.replace(url)
          } else {
            // User has NO workspaces: Send them to onboarding/creation
            router.replace('/workspaces/new')
          }
        } catch (error) {
          // Fallback if the workspace fetch fails (e.g., network blip)
          console.error('Failed to fetch workspaces after login', error)
          toast.error('Logged in, but failed to load your workspaces.')

          // Send them to a safe fallback page where they can retry or see a list
          router.replace('/workspaces')
        }
      }
    },

    onError: (error: unknown) => {
      const errorMsg = isAxiosError<ApiResponse<null>>(error)
        ? (error.response?.data?.message ?? error.message)
        : error instanceof Error
          ? error.message
          : 'Something went wrong!'

      toast.error(errorMsg)
    },
  })
}
