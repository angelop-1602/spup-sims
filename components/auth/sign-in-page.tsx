"use client"

import Image from "next/image"
import { ArrowLeft, ArrowRight, Loader2, LogOut } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type AuthAction = () => void | Promise<void>

type SignInPageProps = {
  accountEmail?: string
  accountName?: string
  errorMessage?: string
  isAuthenticated: boolean
  isBusy?: boolean
  onBack: AuthAction
  onContinue: AuthAction
  onSignIn: AuthAction
  onSignOut: AuthAction
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

export function SignInPage({
  accountEmail,
  accountName,
  errorMessage,
  isAuthenticated,
  isBusy = false,
  onBack,
  onContinue,
  onSignIn,
  onSignOut,
  supportHref = "mailto:support@spup.edu.ph",
}: SignInPageProps) {
  const signedInName = accountName ?? accountEmail ?? "your account"

  return (
    <main className="relative min-h-svh overflow-hidden bg-[#f7f7f5] text-zinc-950">
      <Image
        src="/img/bg-auth.png"
        alt=""
        aria-hidden="true"
        fill
        priority
        sizes="100vw"
        className="object-cover object-[center_bottom]"
      />
      <div className="absolute inset-0 bg-white/15" />

      <div className="relative z-10 flex min-h-svh flex-col px-5 py-5 sm:px-8 lg:px-10">
        <header className="relative mx-auto flex h-14 w-full max-w-6xl items-center justify-between">
          <button
            type="button"
            onClick={() => void onBack()}
            className="inline-flex h-9 items-center gap-1.5 rounded-md px-2 text-xs font-medium text-zinc-700 transition-colors hover:bg-white/55 hover:text-zinc-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900/20"
          >
            <ArrowLeft className="size-3.5" />
            Back
          </button>

          <Image
            src="/SPUP-final-logo.png"
            alt="SPUP logo"
            width={52}
            height={52}
            priority
            className="absolute left-1/2 top-1/2 size-11 -translate-x-1/2 -translate-y-1/2 object-contain"
          />

          <a
            href={supportHref}
            className="rounded-md px-2 py-2 text-xs font-medium text-zinc-700 transition-colors hover:bg-white/55 hover:text-zinc-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900/20"
          >
            Contact support
          </a>
        </header>

        <section className="flex flex-1 items-center justify-center py-8">
          <div className="w-full max-w-[360px] rounded-[8px] border border-black/5 bg-white/95 p-5 text-zinc-950 shadow-[0_24px_80px_rgba(18,18,18,0.12)] backdrop-blur-sm sm:p-6">
            {isAuthenticated ? (
              <div className="space-y-5">
                <div className="space-y-1.5">
                  <p className="text-xs font-medium text-zinc-500">
                    Signed in as
                  </p>
                  <h1 className="text-2xl font-medium leading-tight">
                    {signedInName}
                  </h1>
                  {accountEmail ? (
                    <p className="break-words text-sm text-zinc-500">
                      {accountEmail}
                    </p>
                  ) : null}
                </div>

                <div className="grid gap-2">
                  <Button
                    type="button"
                    className="h-10 w-full justify-between rounded-md bg-zinc-950 text-white hover:bg-zinc-800"
                    onClick={() => void onContinue()}
                  >
                    Continue to HRM
                    <ArrowRight className="size-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="h-10 w-full rounded-md border-zinc-200 bg-white text-zinc-800 hover:bg-zinc-50"
                    onClick={() => void onSignOut()}
                  >
                    <LogOut className="size-4" />
                    Sign out
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-5">
                <div className="space-y-1.5">
                  <h1 className="text-2xl font-medium leading-tight">
                    Log in to SPUP SIMS
                  </h1>
                  <p className="text-sm text-zinc-500">
                    Your school portal starts here
                  </p>
                </div>

                <Button
                  type="button"
                  disabled={isBusy}
                  className="h-10 w-full rounded-md bg-zinc-950 text-white hover:bg-zinc-800"
                  onClick={() => void onSignIn()}
                >
                  {isBusy ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <MicrosoftMark />
                  )}
                  {isBusy ? "Preparing sign-in..." : "Continue with Microsoft"}
                </Button>
              </div>
            )}

            <p
              aria-live="polite"
              className={cn(
                "mt-5 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700",
                !errorMessage && "hidden"
              )}
            >
              {errorMessage}
            </p>

            {!isAuthenticated ? (
              <p className="mt-5 text-center text-xs text-zinc-500">
                Don&apos;t have access?{" "}
                <a
                  href={supportHref}
                  className="font-medium text-zinc-900 underline-offset-4 hover:underline"
                >
                  Contact support
                </a>
              </p>
            ) : null}
          </div>
        </section>
      </div>
    </main>
  )
}
