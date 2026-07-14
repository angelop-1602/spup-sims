"use client"

import * as React from "react"
import Link from "next/link"

import { cn } from "@/lib/utils"
import type { components } from "@/lib/api"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"

type RegisterRequest = components["schemas"]["ApplicantRegisterRequest"]

export default function RegisterForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [email, setEmail] = React.useState("")
  const [firstName, setFirstName] = React.useState("")
  const [lastName, setLastName] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [confirmPassword, setConfirmPassword] = React.useState("")
  const [error, setError] = React.useState<string | null>(null)
  const [submitting, setSubmitting] = React.useState(false)
  const [success, setSuccess] = React.useState(false)

  async function handleSubmit(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)

    if (password !== confirmPassword) {
      setError("Passwords do not match.")
      return
    }

    setSubmitting(true)
    try {
      const body: RegisterRequest = {
        email,
        password,
        confirmPassword,
        profile: {
          firstName,
          lastName,
        },
      }
      const response = await fetch("/api/v1/applicant/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })

      if (!response.ok) {
        const problem = await response.json().catch(() => null)
        setError(problem?.detail || problem?.title || "Registration failed.")
        return
      }

      setSuccess(true)
    } finally {
      setSubmitting(false)
    }
  }

  if (success) {
    return (
      <div className={cn("flex flex-col gap-6", className)} {...props}>
        <Card>
          <CardHeader>
            <CardTitle>Account created</CardTitle>
            <CardDescription>
              Your account has been registered. You can now log in.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/login">Go to login</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Create an account</CardTitle>
          <CardDescription>
            Enter your details below to register.
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium">
                First Name <span className="text-destructive">*</span>
              </label>
              <Input
                value={firstName}
                onChange={(event) => setFirstName(event.target.value)}
                placeholder="John"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Last Name <span className="text-destructive">*</span>
              </label>
              <Input
                value={lastName}
                onChange={(event) => setLastName(event.target.value)}
                placeholder="Doe"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Email <span className="text-destructive">*</span>
              </label>
              <Input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="m@example.com"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Password <span className="text-destructive">*</span>
              </label>
              <Input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Confirm Password <span className="text-destructive">*</span>
              </label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                required
              />
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}
          </CardContent>
          <br></br>

          <CardFooter className="flex-col gap-4">
            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? "Creating account..." : "Create account"}
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              Already have an account? <Link href="/login">Log in</Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
