"use client"

import * as React from "react"
import { useMsal } from "@azure/msal-react"
import { useRouter } from "next/navigation"
import { Bell, ChevronsUpDown, LogOut, Search } from "lucide-react"

import { useHrmAuth } from "@/components/auth/hrm-auth-guard"
import { AppBreadcrumbs } from "./app-breadcrumbs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { ThemeSwitcher } from "@/components/ui/theme-switcher"
import { signOutCurrentAccount } from "@/lib/msalLogout"
import { HRM_NAV_GROUPS } from "./hrm-navigation"

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("")
}

export function AppTopbar() {
  const [open, setOpen] = React.useState(false)
  const router = useRouter()
  const { accounts, instance } = useMsal()
  const { hasPermission } = useHrmAuth()
  const account = accounts[0]
  const displayName = account?.name ?? account?.username ?? "User"
  const roleLabel = account ? "Authenticated" : "Not signed in"
  const initials = getInitials(displayName) || "U"
  const navigationItems = HRM_NAV_GROUPS.flatMap((group) => group.items).filter(
    (item) => !item.requiredPermission || hasPermission(item.requiredPermission)
  )

  React.useEffect(() => {
    const down = (event: KeyboardEvent) => {
      if (event.key === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault()
        setOpen((currentOpen) => !currentOpen)
      }
    }

    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  const handleLogout = async () => {
    await signOutCurrentAccount(instance, account)
  }

  const handleNavigate = (url: string) => {
    setOpen(false)
    router.push(url)
  }

  return (
    <>
      <header className="sticky top-0 z-40 flex h-16 items-center gap-3 border-b bg-background/95 px-4 backdrop-blur md:px-6">
        <SidebarTrigger />

        <AppBreadcrumbs className="flex-1" />

        <div className="ml-auto flex items-center gap-2">
          <Button
            variant="outline"
            className="w-10 justify-start px-0 text-muted-foreground sm:w-52 sm:px-3 lg:w-72"
            onClick={() => setOpen(true)}
            aria-label="Search navigation"
          >
            <Search className="mx-auto size-4 sm:mx-0" />
            <span className="hidden sm:inline">Search navigation</span>
            <kbd className="ml-auto hidden rounded bg-muted px-1.5 py-0.5 text-xs xl:inline-flex">
              Ctrl K
            </kbd>
          </Button>

          <ThemeSwitcher />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Notifications">
                <Bell className="size-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              <DropdownMenuLabel>Notifications</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem disabled>No notifications available.</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="gap-2 px-2">
                <Avatar className="size-8">
                  <AvatarImage src="" alt={`${displayName} avatar`} />
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>

                <div className="hidden text-left md:block">
                  <p className="text-sm font-medium leading-none">{displayName}</p>
                  <p className="text-xs text-muted-foreground">{roleLabel}</p>
                </div>

                <ChevronsUpDown className="hidden size-4 text-muted-foreground md:block" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive"
                onSelect={(event) => {
                  event.preventDefault()
                  void handleLogout()
                }}
              >
                <LogOut className="mr-2 size-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Search HRM navigation..." />

        <CommandList>
          <CommandEmpty>No navigation results found.</CommandEmpty>
          <CommandGroup heading="Navigation">
            {navigationItems.map((item) => (
              <CommandItem
                key={item.url}
                value={item.title}
                onSelect={() => handleNavigate(item.url)}
              >
                <item.icon />
                {item.title}
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  )
}
