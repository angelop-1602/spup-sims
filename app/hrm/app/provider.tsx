"use client"

import * as React from "react"
import { MsalProvider } from "@azure/msal-react"
import { usePathname } from "next/navigation"
import { ThemeProvider } from "next-themes"

import { Toaster } from "@/components/ui/sonner"
import { createMsalInstance } from "@/lib/msal"

export function Providers({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      {pathname === "/redirect" ? children : <MsalProviders>{children}</MsalProviders>}
      <Toaster position="bottom-right" closeButton />
    </ThemeProvider>
  )
}

function MsalProviders({ children }: { children: React.ReactNode }) {
  const [msalInstance] = React.useState(() => createMsalInstance())

  return <MsalProvider instance={msalInstance}>{children}</MsalProvider>
}
