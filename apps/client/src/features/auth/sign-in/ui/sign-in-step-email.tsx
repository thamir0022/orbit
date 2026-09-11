import { Control, Controller } from 'react-hook-form'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Field, FieldError } from '@/shared/ui/field'
import { SocialAuth } from '../../ui/SocialAuth'
import { AuthSeparator } from '../../ui/AuthSeparator'
import { SignInFormData } from '../model/sign-in.schema'
import Link from 'next/link'
import { AuthFooter } from '../../ui/AuthFooter'

export function SignInStepEmail({
  control,
}: {
  control: Control<SignInFormData>
}) {
  return (
    <div className="space-y-2">
      <SocialAuth />
      <AuthSeparator />
      <Controller
        name="email"
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <Input
              {...field}
              type="email"
              aria-invalid={fieldState.invalid}
              placeholder="Email Address"
              className="px-3 py-6 border-2"
            />
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />
      <p className="text-right text-sm lg:text-base text-muted-foreground">
        Forgot Password?{' '}
        <Link href="/password-reset" className="link">
          Reset here
        </Link>
      </p>
      <Button type="submit" className="w-full py-6">
        Continue with Email
      </Button>
      <AuthFooter
        text="Don't have an account?"
        linkText="Sign Up"
        href="/sign-up"
      />
    </div>
  )
}
