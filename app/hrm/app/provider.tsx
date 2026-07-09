"use client"

import * as React from "react"
import { MsalProvider } from "@azure/msal-react"
import { usePathname } from "next/navigation"

import { createMsalInstance } from "@/lib/msal"

export function Providers({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  if (pathname === "/redirect") {
    return <>{children}</>
  }

  return <MsalProviders>{children}</MsalProviders>
}

function MsalProviders({ children }: { children: React.ReactNode }) {
  const [msalInstance] = React.useState(() => createMsalInstance())

  return <MsalProvider instance={msalInstance}>{children}</MsalProvider>
}
