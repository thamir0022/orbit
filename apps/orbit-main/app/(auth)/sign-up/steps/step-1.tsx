import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@orbit/ui/components/button'
import { Field, FieldError, FieldGroup } from '@orbit/ui/components/field'
import { Input } from '@orbit/ui/components/input'
import { Separator } from '@orbit/ui/components/separator'
import { Step } from '@orbit/ui/components/stepper'
import Link from 'next/link'
import { Controller, useForm } from 'react-hook-form'
import { FaGithub } from 'react-icons/fa'
import { FcGoogle } from 'react-icons/fc'
import z from 'zod'

export default function Step1({
  setCurrentStep,
}: {
  setCurrentStep: React.Dispatch<React.SetStateAction<number>>
}) {
  const formSchema = z.object({
    email: z.string().email({ message: 'Please enter a valid email.' }),
  })

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
    },
  })

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    console.log('Form Submitted:', data)
    setCurrentStep((curr: number) => curr + 1)
  }

  return (
    <Step className="flex flex-col gap-2 mx-auto">
      <Button variant="outline" className="py-6 cursor-pointer border-2">
        <FcGoogle className="size-7" />
        Continue with Google
      </Button>
      <Button variant="outline" className="py-6 cursor-pointer border-2">
        <FaGithub size="20" className="size-7" /> Continue with GitHub
      </Button>

      <div className="flex items-center gap-2">
        <Separator className="flex-1" />
        <span className="text-xs whitespace-nowrap font-medium">OR</span>
        <Separator className="flex-1" />
      </div>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
        <FieldGroup>
          <Controller
            name="email"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <Input
                  {...field}
                  aria-invalid={fieldState.invalid}
                  id="email"
                  className="py-6 px-3"
                  placeholder="Email Address"
                  autoComplete="email"
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
        </FieldGroup>

        <Button
          className="w-full py-6 cursor-pointer"
          type="submit"
          disabled={form.formState.isSubmitting}
        >
          {form.formState.isSubmitting
            ? 'Submitting...'
            : 'Continue with Email'}
        </Button>

        <p className="text-center max-sm:text-sm">
          Already have an account?{' '}
          <Link className="link" href="/sign-in">
            Sign In
          </Link>
        </p>
      </form>
    </Step>
  )
}
