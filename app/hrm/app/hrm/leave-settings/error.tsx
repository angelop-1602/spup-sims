'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex min-h-60 flex-col items-center justify-center rounded-lg border border-destructive/30 bg-destructive/5 p-8 text-center">
      <div className="mb-4 text-4xl">⚠️</div>
      <h2 className="text-lg font-semibold">Something went wrong</h2>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        We could not load the leave settings page. Please try again.
      </p>
      <Button onClick={() => reset()} className="mt-6">
        Try again
      </Button>
    </div>
  )
}
