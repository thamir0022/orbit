import Link from 'next/link'

export function AuthFooter({
  text,
  linkText,
  href,
}: {
  href: string
  text: string
  linkText: string
}) {
  return (
    <p className="text-muted-foreground text-center max-sm:text-sm">
      {text}{' '}
      <Link className="link" href={href}>
        {linkText}
      </Link>
    </p>
  )
}
