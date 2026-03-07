"use client"

import { ReactNode } from 'react'
import { AuthProvider } from '@/lib/auth-context'
import { IdeasProvider } from '@/lib/ideas-context'

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <IdeasProvider>
        {children}
      </IdeasProvider>
    </AuthProvider>
  )
}
