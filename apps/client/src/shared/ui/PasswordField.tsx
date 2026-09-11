import { IoIosEye, IoIosEyeOff } from 'react-icons/io'
import { Field, FieldLabel } from './field'
import { InputGroup, InputGroupAddon, InputGroupInput } from './input-group'
import { cn } from '../lib/utils'
import { useState } from 'react'

export interface PasswordFieldProps extends React.ComponentProps<'input'> {
  label?: string
}

const PasswordField = ({
  label = 'Password',
  placeholder = '••••••••',
  className,
  ...props
}: PasswordFieldProps) => {
  const [showPassword, setShowPassword] = useState<boolean>(false)

  const changeVisibility = () => {
    setShowPassword((prev) => !prev)
  }

  return (
    <Field className="max-w-full">
      <FieldLabel htmlFor="password-input">{label}</FieldLabel>
      <InputGroup className="border-2 py-6 overflow-hidden">
        <InputGroupInput
          id="password-input"
          type={showPassword ? 'text' : 'password'}
          className={cn('py-6', className)}
          placeholder={placeholder}
          {...props}
        />
        <InputGroupAddon
          className="cursor-pointer"
          onClick={changeVisibility}
          align="inline-end"
        >
          {showPassword ? <IoIosEyeOff /> : <IoIosEye />}
        </InputGroupAddon>
      </InputGroup>
    </Field>
  )
}

export default PasswordField
