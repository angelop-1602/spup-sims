"use client"

import Image from "next/image"
import { ArrowLeft, LifeBuoy, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { ThemeSwitcher } from "@/components/ui/theme-switcher"
import { cn } from "@/lib/utils"

type AuthAction = () => void | Promise<void>

type SignInPageProps = {
  busyLabel?: string
  errorMessage?: string
  isBusy?: boolean
  onBack: AuthAction
  onSignIn: AuthAction
  supportHref?: string
}

function MicrosoftMark() {
  return (
    <span
      aria-hidden="true"
      className="grid size-4 grid-cols-2 gap-0.5"
    >
      <span className="bg-[#f25022]" />
      <span className="bg-[#7fba00]" />
      <span className="bg-[#00a4ef]" />
      <span className="bg-[#ffb900]" />
    </span>
  )
}

function AuthBackground({ children }: { children: React.ReactNode }) {
  return (
    <main className="relative min-h-svh overflow-hidden bg-background text-foreground">
      <div aria-hidden="true" className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 -left-24 size-96 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -right-32 -bottom-40 size-96 rounded-full bg-accent/50 blur-3xl" />
      </div>

      <div className="relative z-10 flex min-h-svh flex-col px-5 py-5 sm:px-8 lg:px-10">
        {children}
      </div>
    </main>
  )
}

export function SignInPage({
  busyLabel = "Preparing sign-in...",
  errorMessage,
  isBusy = false,
  onBack,
  onSignIn,
  supportHref = "mailto:support@spup.edu.ph",
}: SignInPageProps) {
  return (
    <AuthBackground>
      <header className="relative mx-auto flex h-14 w-full max-w-6xl items-center justify-between">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => void onBack()}
          className="px-2"
        >
          <ArrowLeft aria-hidden="true" />
          Back
        </Button>

        <Image
          src="/SPUP-final-logo.png"
          alt="SPUP logo"
          width={52}
          height={52}
          priority
          className="absolute left-1/2 top-1/2 size-11 -translate-x-1/2 -translate-y-1/2 object-contain"
        />

        <div className="flex items-center gap-1">
          <ThemeSwitcher />
          <Button asChild variant="ghost" size="sm" className="px-2">
            <a href={supportHref} aria-label="Contact support">
              <LifeBuoy aria-hidden="true" className="sm:hidden" />
              <span className="hidden sm:inline">Contact support</span>
            </a>
          </Button>
        </div>
      </header>

      <section className="flex flex-1 items-center justify-center py-8">
        <div className="w-full max-w-[360px] sm:p-6 text-center">
          <div className="space-y-5">
            <div className="space-y-1.5">
              <h1 className="text-2xl font-medium leading-tight">
                Log in to SPUP SIMS
              </h1>
              <p className="text-sm text-muted-foreground">
                Your school portal starts here
              </p>
            </div>

            <Button
              type="button"
              disabled={isBusy}
              className="h-10 w-full"
              onClick={() => void onSignIn()}
            >
              {isBusy ? (
                <Loader2 aria-hidden="true" className="size-4 animate-spin" />
              ) : (
                <MicrosoftMark />
              )}
              {isBusy ? busyLabel : "Continue with Microsoft"}
            </Button>
          </div>

          <p
            aria-live="polite"
            className={cn(
              "mt-5 rounded-md border border-destructive-border bg-destructive-muted px-3 py-2 text-sm text-destructive",
              !errorMessage && "hidden"
            )}
          >
            {errorMessage}
          </p>

          <p className="mt-5 text-center text-xs text-muted-foreground">
            Don&apos;t have access?{" "}
            <a
              href={supportHref}
              className="font-medium text-foreground underline-offset-4 hover:underline focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
            >
              Contact support
            </a>
          </p>
        </div>
      </section>
    </AuthBackground>
  )
}

export function SignInPageSkeleton() {
  return (
    <AuthBackground>
      <header className="relative mx-auto flex h-14 w-full max-w-6xl items-center justify-between">
        <Skeleton className="h-9 w-16" />
        <Skeleton className="absolute left-1/2 top-1/2 size-11 -translate-x-1/2 -translate-y-1/2 rounded-full" />
        <Skeleton className="h-9 w-28" />
      </header>

      <section className="flex flex-1 items-center justify-center py-8">
        <div className="w-full max-w-[360px] rounded-lg border bg-card/95 p-5 shadow-sm backdrop-blur-sm sm:p-6">
          <div className="space-y-5">
            <div className="space-y-2">
              <Skeleton className="h-8 w-56" />
              <Skeleton className="h-4 w-40" />
            </div>
            <Skeleton className="h-10 w-full" />
            <Skeleton className="mx-auto h-3 w-48" />
          </div>
        </div>
      </section>
    </AuthBackground>
  )
}
