import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { API_ROUTES } from '@/shared/api/routes/api.routes'
import { useRouter } from 'next/navigation'
import { httpClient } from '@/shared/api/config/http-client'
import { CreateWorkspaceData } from '@/entities/workspace/model/create-workspace.schema'

type CreateOrgPayload = CreateWorkspaceData & { registrationToken: string }

interface SignUpCompleteResponseData {
  slug: string
}

async function signUpCompleteApi(data: CreateOrgPayload) {
  const res = await httpClient.post<SignUpCompleteResponseData>(
    API_ROUTES.AUTH.SIGN_UP_COMPLETE,
    data
  )
  return res
}

export function useSignUpCompleteMutation() {
  const router = useRouter()

  return useMutation({
    mutationFn: signUpCompleteApi,
    onSuccess: (res) => {
      if (res) {
        toast.success(res.message)
        console.log(res)
        router.replace(`${res.data.slug}/overview`)
      }
    },
  })
}
