import { useMutation } from '@tanstack/react-query'
import { isAxiosError } from 'axios'
import { toast } from 'sonner'
import { axiosInstance } from '@/shared/lib/axios'
import type { ApiResponse } from '@/shared/api/api.types'
import type { CreateWorkspaceData } from '../model/sign-up-complete.schema'
import { API_ROUTES } from '@/shared/api/api.routes'
import { useRouter } from 'next/navigation'

type CreateOrgPayload = CreateWorkspaceData & { registrationToken: string }

interface SignUpCompleteResponseData {
  slug: string
}

async function signUpCompleteApi(
  data: CreateOrgPayload
): Promise<ApiResponse<SignUpCompleteResponseData>> {
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
    onSuccess: (res) => {
      if (res.success) {
        toast.success(res.message)
        console.log(res)
        router.replace(`${res.data.slug}/overview`)
      }
    },
    onError: (error: unknown) => {
      const errorMsg = isAxiosError<ApiResponse<null>>(error)
        ? (error.response?.data?.message ?? error.message)
        : 'Failed to create workspace.'
      toast.error(errorMsg)
    },
  })
}
