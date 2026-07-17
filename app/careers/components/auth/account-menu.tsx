"use client"

import Link from "next/link"
import { ChevronDown, ClipboardList, LogOut, User } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("")
}

export function AccountMenu({
  displayName,
  email,
  onLogout,
}: {
  displayName: string
  email: string
  onLogout: () => void
}) {
  const initials = getInitials(displayName) || "A"

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex items-center gap-2 rounded-md px-1.5 py-1 font-epilogue cursor-pointer transition-colors hover:bg-neutral-100"
        >
          <Avatar className="h-8 w-8">
            <AvatarImage src="" alt={`${displayName} avatar`} />
            <AvatarFallback className="bg-neutral-900 text-white font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>

          <div className="hidden text-left md:block">
            <p className="text-[11px] font-semibold text-neutral-900 leading-none">{displayName}</p>
            <p className="text-[10px] text-neutral-400 mt-1 leading-none">{email}</p>
          </div>

          <ChevronDown className="hidden h-3.5 w-3.5 text-neutral-400 md:block" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56 font-epilogue">
        <DropdownMenuLabel className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wide">
          My Account
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        <DropdownMenuItem asChild className="text-[11px] font-semibold text-neutral-900">
          <Link href="/applicant/profile">
            <User className="mr-2 h-4 w-4" />
            My Profile
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild className="text-[11px] font-semibold text-neutral-900">
          <Link href="/applicant/job-applications">
            <ClipboardList className="mr-2 h-4 w-4" />
            Job Applications
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          className="text-[11px] font-semibold text-destructive"
          onSelect={(event) => {
            event.preventDefault()
            onLogout()
          }}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
