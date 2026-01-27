import Link from 'next/link'

export function AuthFooter({
  text = 'Already have an account?',
  linkText = 'Sign In',
  href = '/sign-in',
}: {
  href?: string
  text?: string
  linkText?: string
}) {
  return (
    <p className="text-center max-sm:text-sm">
      {text}{' '}
      <Link className="link" href={href}>
        {linkText}
      </Link>
    </p>
  )
}
