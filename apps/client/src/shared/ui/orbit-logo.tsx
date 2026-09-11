import Image from 'next/image'
import { Fascinate } from 'next/font/google'
import { cn } from '../lib/utils'
import Link from 'next/link'

const fascinate = Fascinate({
  weight: '400',
  subsets: ['latin'],
})

type Size = 'large' | 'medium' | 'small'
type Variant = 'logo_and_brand_name' | 'logo' | 'brand_name'

interface OrbitLogoProps {
  size?: Size
  variant?: Variant
  className?: string
}

const OrbitLogo = ({
  size = 'medium',
  variant = 'logo_and_brand_name',
  className,
}: OrbitLogoProps) => {
  const sizeConfig = {
    small: {
      image: { width: 100, height: 30 },
      text: 'text-xl md:text-3xl',
    },
    medium: {
      image: { width: 150, height: 50 },
      text: 'text-3xl md:text-5xl',
    },
    large: {
      image: { width: 250, height: 80 },
      text: 'text-5xl md:text-7xl',
    },
  }

  const currentSize = sizeConfig[size]

  const showLogo = variant === 'logo_and_brand_name' || variant === 'logo'
  const showBrandName =
    variant === 'logo_and_brand_name' || variant === 'brand_name'

  return (
    <div className={cn('flex items-center select-none', className)}>
      {showLogo && (
        <Link href="/">
          <Image
            className="dark:invert object-contain shrink-0"
            alt="Orbit Logo"
            src="/orbit-logo.webp"
            width={currentSize.image.width}
            height={currentSize.image.height}
            unoptimized // Webp type have some optimization issue in newer next version
          />
        </Link>
      )}

      {showBrandName && (
        <Link
          href="/"
          className={cn(
            'tracking-tight text-foreground',
            currentSize.text,
            fascinate.className
          )}
        >
          Orbit
        </Link>
      )}
    </div>
  )
}

export default OrbitLogo
