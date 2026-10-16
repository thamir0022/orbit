'use client'

import { Step } from '@/shared/ui/stepper'
import { useSignUpStore } from '../../model/sign-up.store'
import { useSignUpCompleteMutation } from '../../api/sign-up-complete.mutation'
import { WorkspaceCreateForm } from '@/widgets/workspace/ui/workspace-create-form'
import { CreateWorkspaceData } from '@/entities/workspace/model/create-workspace.schema'

export function SignUpCompleteStep() {
  const email = useSignUpStore((state) => state.email)
  const registrationToken = useSignUpStore((state) => state.registrationToken)

  const { mutate: completeSignup, isPending } = useSignUpCompleteMutation()

  function onSubmit(data: CreateWorkspaceData) {
    if (!email || !registrationToken) return

    completeSignup({
      ...data,
      registrationToken,
    })
  }

  return (
    <Step>
      <WorkspaceCreateForm onSubmit={onSubmit} isLoading={isPending} />
    </Step>
  )
}
