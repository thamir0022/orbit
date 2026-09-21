import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import type { EmailStepData } from '../model/sign-up-initiate.schema'
import { API_ROUTES } from '@/shared/api/routes/api.routes'
import { httpClient } from '@/shared/api/config/http-client'

// Pure API function (could also be extracted to a separate file)
async function signUpInitiateApi(data: EmailStepData) {
  const res = await httpClient.post(API_ROUTES.AUTH.SIGN_UP_INITIATE, data)
  return res
}

export function useSignUpMutation(onSuccessCallback?: () => void) {
  return useMutation({
    mutationFn: signUpInitiateApi,
    onSuccess: (data) => {
      if (data.success) {
        toast.success(data.message || 'Verification code sent!')
        onSuccessCallback?.() // Trigger the step change
      }
    },
  })
}
