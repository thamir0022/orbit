import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { isAxiosError } from 'axios'
import { signOutApi } from '../api/sign-out.api'

export function useSignOutMutation() {
  return useMutation({
    mutationFn: signOutApi,
    onSuccess: async () => {
      toast.success('You are successfully sign out')

      // 4. Hard redirect to the sign-in page to reset the Next.js router cache
      window.location.assign('/sign-in')
    },

    onError: (error: unknown) => {
      const errorMsg = isAxiosError(error)
        ? (error.response?.data?.message ?? error.message)
        : 'An error occurred during sign out'

      console.error('[SignOut Error]:', errorMsg)
    },
  })
}
