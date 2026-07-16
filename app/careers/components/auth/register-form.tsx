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
import { z } from 'zod';
import {
  FieldDescription,
} from "@/components/ui/field"

type RegisterRequest = components["schemas"]["ApplicantRegisterRequest"]

const registerSchema = z
  .object({
    email: z.email("Enter a valid email address."),
    password: z.string().min(8, "Password must be at least 8 characters."),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  })

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
  const [fieldErrors, setFieldErrors] = React.useState<{
    email?: string
    password?: string
    confirmPassword?: string
  }>({})
  const [submitting, setSubmitting] = React.useState(false)
  const [success, setSuccess] = React.useState(false)

  async function handleSubmit(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)

    const result = registerSchema.safeParse({ email, password, confirmPassword })
    if (!result.success) {
      const flat = z.flattenError(result.error).fieldErrors
      setFieldErrors({
        email: flat.email?.[0],
        password: flat.password?.[0],
        confirmPassword: flat.confirmPassword?.[0],
      })
      return
    }
    setFieldErrors({})

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
              Verify your email address and log in to continue.
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

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <CardContent className="space-y-6">
            <div>
              <label className="mb-2 block text-sm font-medium">
                First Name <span className="text-destructive">*</span>
              </label>
              <Input
                value={firstName}
                onChange={(event) => setFirstName(event.target.value)}
                placeholder="Jane"
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
                placeholder="ict@spup.edu.ph"
                required
              />
              {fieldErrors.email && (
                <p className="mt-1 text-sm text-destructive">{fieldErrors.email}</p>
              )}
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Password <span className="text-destructive">*</span>
              </label>
              <Input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter your password"
                required
              />
              {fieldErrors.password && (
                <p className="mt-1 text-sm text-destructive">{fieldErrors.password}</p>
              )}
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Confirm Password <span className="text-destructive">*</span>
              </label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                placeholder="Confirm your password"
                required
              />
              {fieldErrors.confirmPassword && (
                <p className="mt-1 text-sm text-destructive">
                  {fieldErrors.confirmPassword}
                </p>
              )}
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}
          </CardContent>

          <CardFooter className="flex-col gap-4">
            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? "Creating account..." : "Create account"}
            </Button>
            <FieldDescription className="text-center text-sm text-muted-foreground">
              Already have an account? <Link href="/login" className="text-foreground no-underline! hover:underline!">
                Login
              </Link>
            </FieldDescription>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
