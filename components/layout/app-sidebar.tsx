"use client"

import Link from "next/link"
import {
  LayoutDashboard,
  Users,
  UserRoundPlus,
  IdCard,
  Settings,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"

const menuItems = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    url: "/hrm/dashboard",
  },
  {
    title: "Applicants",
    icon: UserRoundPlus,
    url: "/hrm/applicants",
  },
  {
    title: "Employees",
    icon: Users,
    url: "/hrm/employees",
  },
  {
    title: "Portfolio",
    icon: IdCard,
    url: "/hrm/employees/portfolio",
  },
]

export function AppSidebar() {
  return (
    <Sidebar collapsible="icon" className="border-r">
      <SidebarHeader>
        <div className="flex h-14 items-center px-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            HR
          </div>

          <div className="ml-3 group-data-[collapsible=icon]:hidden">
            <p className="text-sm font-semibold">SPUP SIMS</p>
            <p className="text-xs text-muted-foreground">HRM Module</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={item.title}>
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton>
              <Settings />
              <span>System Settings</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
