'use client'

import { motion, type HTMLMotionProps } from 'motion/react'

interface SlideWrapperProps extends HTMLMotionProps<'div'> {
  direction: number
}

const variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? '100%' : '-100%',
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction < 0 ? '100%' : '-100%',
    opacity: 0,
  }),
}

export function SlideWrapper({
  children,
  direction,
  className,
  ...props
}: SlideWrapperProps) {
  return (
    <motion.div
      custom={direction}
      variants={variants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={{
        x: { type: 'spring', stiffness: 300, damping: 30 },
        opacity: { duration: 0.2 },
      }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  )
}
