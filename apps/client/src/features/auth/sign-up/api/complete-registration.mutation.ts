import { useMutation } from '@tanstack/react-query'
import { isAxiosError } from 'axios'
import { toast } from 'sonner'
import { axiosInstance } from '@/shared/lib/axios'
import type { ApiResponse } from '@/shared/api/api.types'
import type { ProfileStepData } from '../model/sign-up-details.schema'
import { API_ROUTES } from '@/shared/api/api.routes'
import { useRouter } from 'next/navigation'

// We omit confirmPassword before sending to the server
type SetupProfilePayload = Omit<ProfileStepData, 'confirmPassword'> & {
  registrationToken: string
  invitationToken: string
}

async function signUpDetailsApi(
  data: SetupProfilePayload
): Promise<ApiResponse<{ slug: string }>> {
  const response = await axiosInstance.post(
    API_ROUTES.AUTH.COMPLETE_REGISTRATION,
    data
  )
  return response.data
}

export function useCompleteRegistrationMutation() {
  const router = useRouter()

  return useMutation({
    mutationFn: signUpDetailsApi,
    onSuccess: (data) => {
      if (data.success) {
        toast.success(data.message)
        router.replace(`/${data.data.slug}/overview`)
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
