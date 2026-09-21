import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { signOutApi } from '../api/sign-out.api'
import { useRouter } from 'next/navigation'

export function useSignOutMutation() {
  const router = useRouter()

  return useMutation({
    mutationFn: signOutApi,
    onSuccess: async (res) => {
      toast.success(res.message)

      router.replace('/sign-in')
    },
  })
}
