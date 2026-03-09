import { useMutation } from '@tanstack/react-query'
import { isAxiosError } from 'axios'
import { toast } from 'sonner'
import { axiosInstance } from '@/shared/lib/axios.instance'
import type { ApiResponse } from '@/shared/api/api.types'
import type { ProfileStepData } from '../model/sign-up-details.schema'
import { API_ROUTES } from '@/shared/api/api.routes'

// We omit confirmPassword before sending to the server
type SetupProfilePayload = Omit<ProfileStepData, 'confirmPassword'> & {
  registrationToken: string
}

async function signUpDetailsApi(
  data: SetupProfilePayload
): Promise<ApiResponse<null>> {
  const response = await axiosInstance.post(
    API_ROUTES.AUTH.SIGN_UP_DETAILS,
    data
  )
  return response.data
}

export function useSignUpDetailsMutation(onSuccessCallback?: () => void) {
  return useMutation({
    mutationFn: signUpDetailsApi,
    onSuccess: (data) => {
      if (data.success) {
        toast.success(data.message || 'Profile created!')
        onSuccessCallback?.()
      }
    },
    onError: (error: unknown) => {
      const errorMsg = isAxiosError<ApiResponse<null>>(error)
        ? (error.response?.data?.message ?? error.message)
        : 'Failed to create profile.'
      toast.error(errorMsg)
    },
  })
}
