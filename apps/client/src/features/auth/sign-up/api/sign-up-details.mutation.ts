import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import type { ProfileStepData } from '../model/sign-up-details.schema'
import { API_ROUTES } from '@/shared/api/routes/api.routes'
import { httpClient } from '@/shared/api/config/http-client'

// We omit confirmPassword before sending to the server
type SetupProfilePayload = Omit<ProfileStepData, 'confirmPassword'> & {
  registrationToken: string
}

async function signUpDetailsApi(data: SetupProfilePayload) {
  const res = await httpClient.post(API_ROUTES.AUTH.SIGN_UP_DETAILS, data)
  return res
}

export function useSignUpDetailsMutation(onSuccessCallback?: () => void) {
  return useMutation({
    mutationFn: signUpDetailsApi,
    onSuccess: (data) => {
      if (data.success) {
        toast.success(data.message)
        onSuccessCallback?.()
      }
    },
  })
}
