'use client'

import { collapseVariants } from '@/shared/lib/animation/variants'
import { Button } from '@orbit/ui/components/button'
import { motion } from 'motion/react'
import { FaGithub } from 'react-icons/fa'
import { FcGoogle } from 'react-icons/fc'

export function SocialAuth() {
  return (
    <motion.div
      variants={collapseVariants}
      initial="initial"
      exit="exit"
      className="flex flex-col gap-2"
    >
      <Button variant="outline" className="cursor-pointer border-2 py-6">
        <FcGoogle className="size-7" />
        Continue with Google
      </Button>
      <Button variant="outline" className="cursor-pointer border-2 py-6">
        <FaGithub size="20" className="size-7" /> Continue with GitHub
      </Button>
    </motion.div>
  )
}
