import { useMutation } from '@tanstack/react-query'
import { isAxiosError } from 'axios'
import { toast } from 'sonner'
import { axiosInstance } from '@/shared/lib/axios'
import type { ApiResponse } from '@/shared/api/api.types'
import type { SignUpCompleteData } from '../model/sign-up-complete.schema'
import { API_ROUTES } from '@/shared/api/api.routes'

interface AuthResponseData {
  redirectUrl: string
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
  return useMutation({
    mutationFn: signUpCompleteApi,
    onSuccess: (data) => {
      if (data.success && data.data?.redirectUrl) {
        toast.success(data.message)

        window.location.assign(data.data?.redirectUrl)
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
