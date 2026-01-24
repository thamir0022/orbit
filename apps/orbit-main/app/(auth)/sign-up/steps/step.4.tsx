import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@orbit/ui/components/button'
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@orbit/ui/components/field'
import { Input } from '@orbit/ui/components/input'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from '@orbit/ui/components/input-group'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@orbit/ui/components/select'
import { Badge } from '@orbit/ui/components/badge'
import { Step } from '@orbit/ui/components/stepper'
import { Controller, useForm } from 'react-hook-form'
import z from 'zod'

export default function Step4({}: {
  setCurrentStep: React.Dispatch<React.SetStateAction<number>>
}) {
  const ORG_TYPES = ['startup', 'enterprise', 'agency'] as const
  const TEAM_SIZES = [
    'solo',
    '2-10',
    '11-50',
    '51-200',
    '201-500',
    '500+',
  ] as const

  const formSchema = z.object({
    name: z.string().min(1, { message: 'Organization name is required.' }),
    subdomain: z.string().min(1, { message: 'Subdomain is required.' }),
    type: z.enum(ORG_TYPES, {
      message: 'Please select an organization type.',
    }),
    size: z
      .enum(TEAM_SIZES, { message: 'Please select a team size.' })
      .optional(),
  })

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      subdomain: '',
      type: undefined,
      size: undefined,
    },
  })

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    console.log(data)
  }

  return (
    <Step className="">
      <h2 className="text-center mb-5 sub-heading">Create Your Organization</h2>
      <form id="create-org-form" onSubmit={form.handleSubmit(onSubmit)}>
        <FieldGroup className="flex gap-3">
          <Controller
            name="name"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="name">Organization Name</FieldLabel>
                <Input
                  {...field}
                  id="name"
                  aria-invalid={fieldState.invalid}
                  placeholder="Organization Name"
                  className="py-6 px-3"
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
          <Controller
            name="subdomain"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="subdomain">Subdomain</FieldLabel>
                <InputGroup className="py-6">
                  <InputGroupAddon>
                    <InputGroupText>https://</InputGroupText>
                  </InputGroupAddon>
                  <InputGroupInput
                    {...field}
                    id="name"
                    aria-invalid={fieldState.invalid}
                    placeholder="subdomain"
                  />
                  <InputGroupAddon align="inline-end">
                    <InputGroupText>.orbit.com</InputGroupText>
                  </InputGroupAddon>
                </InputGroup>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
          <Controller
            name="type"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>Organization Type</FieldLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger aria-invalid={fieldState.invalid}>
                    <SelectValue placeholder="Select organization type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup className="*:cursor-pointer">
                      <SelectItem value="startup">Start Up</SelectItem>
                      <SelectItem value="enterprise">Enterprise</SelectItem>
                      <SelectItem value="agency">Agency</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <Controller
            name="size"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>How big is your team?</FieldLabel>
                <div className="flex flex-wrap gap-3 *:cursor-pointer">
                  <Badge
                    variant={field.value === 'solo' ? 'default' : 'outline'}
                    onClick={() => field.onChange('solo')}
                  >
                    Just Me
                  </Badge>
                  <Badge
                    variant={field.value === '2-10' ? 'default' : 'outline'}
                    onClick={() => field.onChange('2-10')}
                  >
                    2 - 10
                  </Badge>
                  <Badge
                    variant={field.value === '11-50' ? 'default' : 'outline'}
                    onClick={() => field.onChange('11-50')}
                  >
                    11 - 50
                  </Badge>
                  <Badge
                    variant={field.value === '51-200' ? 'default' : 'outline'}
                    onClick={() => field.onChange('51-200')}
                  >
                    51 - 200
                  </Badge>
                  <Badge
                    variant={field.value === '201-500' ? 'default' : 'outline'}
                    onClick={() => field.onChange('201-500')}
                  >
                    201 - 500
                  </Badge>
                  <Badge
                    variant={field.value === '500+' ? 'default' : 'outline'}
                    onClick={() => field.onChange('500+')}
                  >
                    500 +
                  </Badge>
                </div>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
          <Button
            form="create-org-form"
            className="w-full py-6 cursor-pointer max-sm:font-bold font-medium"
          >
            Create Organization
          </Button>
        </FieldGroup>
      </form>
    </Step>
  )
}
