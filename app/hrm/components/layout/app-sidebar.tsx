"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { useHrmAuth } from "@/components/auth/hrm-auth-guard"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import {
  HRM_NAV_GROUPS,
  isHrmNavItemActive,
  type HrmNavItem,
} from "./hrm-navigation"

function NavGroup({
  label,
  items,
  hasPermission,
  pathname,
}: {
  label: string
  items: HrmNavItem[]
  hasPermission: (permission: string) => boolean
  pathname: string
}) {
  const visibleItems = items.filter(
    (item) => !item.requiredPermission || hasPermission(item.requiredPermission)
  )

  if (visibleItems.length === 0) return null

  return (
    <SidebarGroup>
      <SidebarGroupLabel>{label}</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {visibleItems.map((item) => {
            const isActive = isHrmNavItemActive(pathname, item.url)

            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild tooltip={item.title} isActive={isActive}>
                  <Link href={item.url} aria-current={isActive ? "page" : undefined}>
                    <item.icon />
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}

export function AppSidebar() {
  const { hasPermission } = useHrmAuth()
  const pathname = usePathname()

  return (
    <Sidebar collapsible="icon" className="border-r">
      <SidebarHeader>
        <div className="flex h-14 items-center px-2">
          <div className="flex size-9 items-center justify-center rounded-lg bg-primary text-sm font-semibold text-primary-foreground">
            HR
          </div>

          <div className="ml-3 group-data-[collapsible=icon]:hidden">
            <p className="text-sm font-semibold">SPUP HRM</p>
            <p className="text-xs text-muted-foreground">Part of SIMS</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        {HRM_NAV_GROUPS.map((group) => (
          <NavGroup
            key={group.label}
            label={group.label}
            items={group.items}
            hasPermission={hasPermission}
            pathname={pathname}
          />
        ))}
      </SidebarContent>

      <SidebarRail />
    </Sidebar>
  )
}
