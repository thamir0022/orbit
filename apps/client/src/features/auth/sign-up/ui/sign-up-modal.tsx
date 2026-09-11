'use client'

import { useRouter } from 'next/navigation'
import { Controller, useForm } from 'react-hook-form'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import {
  Field,
  FieldContent,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/shared/ui/field'
import Link from 'next/link'
import { zodResolver } from '@hookform/resolvers/zod'
import OrbitLogo from '@/shared/ui/orbit-logo'
import { SignUpFormData, signUpSchema } from '../model/sign-up.schema'
import { useSignUpStore } from '../model/sign-up.store'
import { Stepper } from '@/shared/ui/stepper'
import { SignUpInitiateStep } from './steps/SignUpInitiateStep'
import { SignUpVerifyStep } from './steps/SignUpVerifyStep'
import { SignUpDetailsStep } from './steps/SignUpDetailsStep'
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
