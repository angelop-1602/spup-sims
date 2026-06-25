"use client"

import Link from "next/link"
import {
  LayoutDashboard,
  Users,
  UserRoundPlus,
  IdCard,
  Settings,
  FilePen,
  Building,
  Pin,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
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
    title: "My Portfolio",
    icon: IdCard,
    url: "/hrm/employees/portfolio",
  },
]

const hrMenuItems = [
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
    title: "Leave Applications",
    icon: FilePen,
    url: "#",
  },
  {
    title: "Departments",
    icon: Building,
    url: "#",
  },
  {
    title: "Designations",
    icon: Pin,
    url: "#",
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
          <SidebarGroupLabel>Main</SidebarGroupLabel>
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
        <SidebarGroup>
          <SidebarGroupLabel>Human Resource Management</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {hrMenuItems.map((item) => (
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
