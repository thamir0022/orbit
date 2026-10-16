'use client'

import { useRouter } from 'next/navigation'

import { Dialog, DialogContent, DialogTitle } from '@/shared/ui/dialog'
import { useSignUpStore } from '../model/sign-up.store'
import { Stepper } from '@/shared/ui/stepper'
import { SignUpInitiateStep } from './steps/SignUpInitiateStep'
import { SignUpVerifyStep } from './steps/SignUpVerifyStep'
import { useState } from 'react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/shared/ui/alert-dialog'
import { CompleteRegistrationStep } from './steps/CompleteRegistrationStep'

export function SignUpModal() {
  const [openAlert, setOpenAlert] = useState<boolean>(false)
  const router = useRouter()

  const { currentStep, reset } = useSignUpStore()

  const handleDialogClose = () => {
    if (currentStep > 1) setOpenAlert(true)
    else router.back()
  }

  const handleAlertClose = () => {
    reset()
    router.back()
  }

  return (
    <Dialog open onOpenChange={handleDialogClose}>
      <DialogTitle aria-hidden>Create Your Orbit Account</DialogTitle>
      <DialogContent className="sm:max-w-md">
        <Stepper currentStep={currentStep}>
          <SignUpInitiateStep />
          <SignUpVerifyStep />
          <CompleteRegistrationStep />
        </Stepper>
      </DialogContent>
      <AlertDialog open={openAlert} onOpenChange={setOpenAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your
              account from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleAlertClose}>
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  )
}
