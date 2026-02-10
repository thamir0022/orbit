import { Variants } from 'motion/react'

export const collapseVariants: Variants = {
  initial: { opacity: 1, height: 'auto' },
  exit: { opacity: 0, height: 0, overflow: 'hidden' },
}

export const expandVariants: Variants = {
  initial: { opacity: 0, height: 0, marginTop: 0 },
  animate: { opacity: 1, height: 'auto', marginTop: -10 },
  exit: { opacity: 0, height: 0, marginTop: 0 },
}
