import { Step } from '../stepper'
import { Button } from '@/shared/ui/button'
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
  REGEXP_ONLY_DIGITS,
} from '@/shared/ui/input-otp'
import { IoIosArrowBack } from 'react-icons/io'

export function OtpVerificationStep({
  setCurrentStep,
}: {
  setCurrentStep: React.Dispatch<React.SetStateAction<number>>
}) {
  const onComplete = (data: string) => {
    console.log('OTP:', data)
    setCurrentStep((curr) => curr + 1)
  }
  return (
    <Step className="mx-auto space-y-2">
      <h2 className="sub-heading text-center">Enter your OTP</h2>
      <p className="text-center">
        We have sent an code to your email,{' '}
        <span className="font-medium hover:underline cursor-pointer">
          thamir@mail.com
        </span>
      </p>
      <div className="flex justify-center">
        <InputOTP
          className="mx-auto"
          id="otp"
          maxLength={6}
          pattern={REGEXP_ONLY_DIGITS}
          onComplete={onComplete}
        >
          <InputOTPGroup>
            <InputOTPSlot index={0} />
            <InputOTPSlot index={1} />
            <InputOTPSlot index={2} />
          </InputOTPGroup>
          <InputOTPSeparator />
          <InputOTPGroup>
            <InputOTPSlot index={3} />
            <InputOTPSlot index={4} />
            <InputOTPSlot index={5} />
          </InputOTPGroup>
        </InputOTP>
      </div>
      <div className="flex justify-between">
        <Button
          onClick={() => setCurrentStep((curr) => curr - 1)}
          variant="link"
          className="link"
        >
          <IoIosArrowBack />
          Back
        </Button>
        <Button variant="link" className="link">
          Resend
        </Button>
      </div>
    </Step>
  )
}
