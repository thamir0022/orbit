import { motion, type Transition } from 'motion/react'
import * as React from 'react'

const VARIANTS = {
  enter: (direction: number) => ({
    x: direction > 0 ? '110%' : '-110%',
    opacity: 0,
    filter: 'blur(4px)',
  }),
  center: { x: 0, opacity: 1, filter: 'blur(0px)' },
  exit: (direction: number) => ({
    x: direction < 0 ? '110%' : '-110%',
    opacity: 0,
    filter: 'blur(4px)',
  }),
}

const TRANSITION: Transition = {
  type: 'spring',
  stiffness: 300,
  damping: 30,
}

interface SlideWrapperProps {
  children: React.ReactNode
  direction: number
  className?: string
}

export function SlideWrapper({
  children,
  direction,
  className,
}: SlideWrapperProps) {
  return (
    <motion.div
      custom={direction}
      variants={VARIANTS}
      initial="enter"
      animate="center"
      exit="exit"
      transition={TRANSITION}
      className={className}
    >
      {children}
    </motion.div>
  )
}
