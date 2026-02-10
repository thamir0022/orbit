import React from 'react'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="size-full flex items-center justify-center">{children}</div>
  )
}
