"use client"

import Link from "next/link"
import {
  LayoutDashboard,
  Users,
  UserRoundPlus,
  IdCard,
  FilePen,
  Building,
  UserRoundCog,
  UserLock,
  FileSliders,
  CloudDownload,
} from "lucide-react"

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
import { useHrmAuth } from "@/components/auth/hrm-auth-guard"

type NavItem = {
  title: string
  icon: React.ElementType
  url: string
  requiredPermission?: string
}

// Main section — always visible to all authenticated users
const mainItems: NavItem[] = [
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

// Human Resource Management section — shown only when the user has at least one item visible
const hrItems: NavItem[] = [
  {
    title: "Applicants",
    icon: UserRoundPlus,
    url: "/hrm/applicants",
    // hrms.recruitment.applicants.view → HR Administrator (4), HR Staff (11), Department Head (6), Super Admin
    requiredPermission: "hrms.recruitment.applicants.view",
  },
  {
    title: "Employees",
    icon: Users,
    url: "/hrm/employees",
    // hrms.employees.view → HR Administrator (4), HR Staff (11), Department Head (6), Super Admin
    requiredPermission: "hrms.employees.view",
  },
  {
    title: "Leave Applications",
    icon: FilePen,
    url: "/hrm/leave-applications",
    // hrms.leave.viewOwn → every employee; approvers additionally see the
    // Department/HR approval tabs on the page itself.
    requiredPermission: "hrms.leave.viewOwn",
  },
  {
    title: "Departments",
    icon: Building,
    url: "/hrm/departments",
    // org.departments.view → HR Administrator (4), Academic Admin (12), Department Head (6), Registrar (2), Super Admin
    requiredPermission: "org.departments.view",
  },
]

// Settings section — shown only when the user has at least one item visible
const settingsItems: NavItem[] = [
  {
    title: "Leave Settings",
    icon: FileSliders,
    url: "/hrm/leave-settings",
    // hrms.leaveTypes.view → HR Administrator (4), HR Staff (11), Super Admin
    requiredPermission: "hrms.leaveTypes.view",
  },
  {
    title: "Azure Users",
    icon: CloudDownload,
    url: "/hrm/azure-users",
    // hrms.azure.users.view → HR Administrator (4), Super Admin
    requiredPermission: "hrms.azure.users.view",
  },
  {
    title: "User Management",
    icon: UserRoundCog,
    url: "/hrm/users",
    // identity.users.view → HR Administrator (4), Super Admin
    requiredPermission: "identity.users.view",
  },
  {
    title: "Roles & Permissions",
    icon: UserLock,
    url: "/hrm/roles-permissions",
    // identity.roles.view → HR Administrator (4), Super Admin
    requiredPermission: "identity.roles.view",
  },
]

function NavGroup({
  label,
  items,
  hasPermission,
}: {
  label: string
  items: NavItem[]
  hasPermission: (permission: string) => boolean
}) {
  const visibleItems = items.filter(
    (item) => !item.requiredPermission || hasPermission(item.requiredPermission)
  )

  // Hide the entire group (label + menu) when no items are visible
  if (visibleItems.length === 0) return null

  return (
    <SidebarGroup>
      <SidebarGroupLabel>{label}</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {visibleItems.map((item) => (
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
  )
}

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
        {/* Main — always visible, no permission required */}
        <NavGroup label="Main" items={mainItems} hasPermission={hasPermission} />

        {/* HRM section — hidden entirely for Employee role */}
        <NavGroup
          label="Human Resource Management"
          items={hrItems}
          hasPermission={hasPermission}
        />

        {/* Settings section — hidden entirely for Employee and Department Head roles */}
        <NavGroup
          label="Settings"
          items={settingsItems}
          hasPermission={hasPermission}
        />
      </SidebarContent>

      <SidebarRail />
    </Sidebar>
  )
}
