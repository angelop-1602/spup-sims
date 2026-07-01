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
import { useHrmAuth } from "@/components/auth/hrm-auth-guard"

const menuItems = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    url: "/hrm/dashboard",
  },
  {
    title: "My Portfolio",
    icon: IdCard,
    url: "/hrm/portfolio",
  },
]

const hrMenuItems = [
  {
    title: "Applicants",
    icon: UserRoundPlus,
    url: "/hrm/applicants",
   // requiredPermission: "hrms.applicants.view",
  },
  {
    title: "Employees",
    icon: Users,
    url: "/hrm/employees",
    //requiredPermission: "hrms.employees.view",
  },
  {
    title: "Leave Applications",
    icon: FilePen,
    url: "#",
    //requiredPermission: "hrms.leave.view",
  },
  {
    title: "Departments",
    icon: Building,
    url: "/hrm/departments",
    requiredPermission: "organization.departments.view",
  },
  {
    title: "Designations",
    icon: Pin,
    url: "#",
    //requiredPermission: "hrms.designations.view",
  },
  {
    title: "Roles & Permissions",
    icon: Pin,
    url: "/hrm/roles-permissions",
    requiredPermission: "",
  },
]

export function AppSidebar() {
  const { hasPermission } = useHrmAuth()

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
              {hrMenuItems
                .filter(
                  (item) =>
                    !item.requiredPermission || hasPermission(item.requiredPermission)
                )
                .map((item) => (
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
