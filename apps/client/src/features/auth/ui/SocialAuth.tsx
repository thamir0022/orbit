'use client'

import { Button } from '@/shared/ui/button'
import { motion, Variants } from 'motion/react'
// import { FaGithub } from 'react-icons/fa'
import { FcGoogle } from 'react-icons/fc'
import { loginWithProvider } from '../hooks/use-oauth'

const collapseVariants: Variants = {
  initial: { opacity: 1, height: 'auto' },
  exit: { opacity: 0, height: 0, overflow: 'hidden' },
}

export function SocialAuth() {
  return (
    <motion.div
      variants={collapseVariants}
      initial="initial"
      exit="exit"
      className="flex flex-col gap-2"
    >
      <Button
        variant="outline"
        type="button"
        onClick={() => loginWithProvider('google')}
        className="cursor-pointer border-2 py-6"
      >
        <FcGoogle className="size-7" />
        Continue with Google
      </Button>
      {/* <Button
        variant="outline"
        type="button"
        className="cursor-pointer border-2 py-6"
      >
        <FaGithub size="20" className="size-7" /> Continue with GitHub
      </Button> */}
    </motion.div>
  )
}
