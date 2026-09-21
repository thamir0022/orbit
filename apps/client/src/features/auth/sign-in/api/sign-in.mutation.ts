import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useRouter, useSearchParams } from 'next/navigation'
import { signInApi } from './sign-in.api'
import type { SignInFormData } from '../model/sign-in.schema'

export function useSignInMutation() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const redirectUrl = searchParams.get('redirecturl')

  return useMutation({
    mutationFn: (data: SignInFormData) => signInApi(data),

    // 2. Make the onSuccess callback async
    onSuccess: async (res) => {
      if (res.success) {
        toast.success(res.message)

        const workspaces = res.data.workspaces

        // 4. Handle the routing logic based on the user's workspace state
        if (workspaces && workspaces.length > 0) {
          const url =
            workspaces.length === 1
              ? `/${workspaces[0].slug}/overview`
              : redirectUrl
                ? redirectUrl
                : '/workspaces'

          router.replace(url)
        }

        if (workspaces.length === 0) {
          router.replace('/workspaces/new')
        }
      }
    },
  })
}
