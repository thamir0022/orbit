import React from 'react'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex-1 flex items-center justify-center w-full">
      {/* Adding a min-h-full or min-h-[inherit] ensures it fills the 
         available space provided by the ScrollArea's flex container.
      */}
      <div className="w-full h-full flex items-center justify-center py-10">
        {children}
      </div>
    </div>
  )
}
