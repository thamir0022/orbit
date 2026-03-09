import { useMutation } from '@tanstack/react-query'
import { isAxiosError } from 'axios'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { axiosInstance } from '@/shared/lib/axios.instance'
import type { ApiResponse } from '@/shared/api/api.types'
import type { SignUpCompleteData } from '../model/sign-up-complete.schema'
import { API_ROUTES } from '@/shared/api/api.routes'

// Assuming this final step returns auth tokens to log the user in
interface AuthResponseData {
  token: string
  workspaceId: string
}

type CreateOrgPayload = SignUpCompleteData & { registrationToken: string }

async function signUpCompleteApi(
  data: CreateOrgPayload
): Promise<ApiResponse<AuthResponseData>> {
  const response = await axiosInstance.post(
    API_ROUTES.AUTH.SIGN_UP_COMPLETE,
    data
  )
  return response.data
}

export function useSignUpCompleteMutation() {
  const router = useRouter()

  return useMutation({
    mutationFn: signUpCompleteApi,
    onSuccess: (data) => {
      if (data.success) {
        toast.success('Organization created! Welcome aboard.')
        // Final routing into the application
        router.push('/dashboard')
      }
    },
    onError: (error: unknown) => {
      const errorMsg = isAxiosError<ApiResponse<null>>(error)
        ? (error.response?.data?.message ?? error.message)
        : 'Failed to create organization.'
      toast.error(errorMsg)
    },
  })
}
