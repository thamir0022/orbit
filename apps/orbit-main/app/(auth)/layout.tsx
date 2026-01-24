import React from 'react'
import { AuthFooter } from './components/auth-footer'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="w-screen h-screen flex items-center justify-center">
      {children}
      <AuthFooter />
    </div>
  )
}
