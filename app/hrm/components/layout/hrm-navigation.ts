import type { LucideIcon } from "lucide-react"
import {
  Briefcase,
  Building,
  CloudDownload,
  FileSliders,
  IdCard,
  LayoutDashboard,
  Layers,
  UserLock,
  UserRoundPlus,
  Users,
} from "lucide-react"

export type HrmNavItem = {
  title: string
  icon: LucideIcon
  url: string
  requiredPermission?: string
}

export type HrmNavGroup = {
  label: string
  items: HrmNavItem[]
}

export type HrmBreadcrumbItem = {
  label: string
  href?: string
}

export const HRM_NAV_GROUPS: HrmNavGroup[] = [
  {
    label: "Main",
    items: [
      { title: "Dashboard", icon: LayoutDashboard, url: "/hrm/dashboard" },
      { title: "My Portfolio", icon: IdCard, url: "/hrm/portfolio" },
    ],
  },
  {
    label: "Human Resources",
    items: [
      {
        title: "Job Postings",
        icon: Briefcase,
        url: "/hrm/job-postings",
        requiredPermission: "hrms.recruitment.job-postings.view",
      },
      {
        title: "Applicants",
        icon: UserRoundPlus,
        url: "/hrm/applicants",
        requiredPermission: "hrms.recruitment.applicants.view",
      },
      {
        title: "Employees",
        icon: Users,
        url: "/hrm/employees",
        requiredPermission: "hrms.employees.view",
      },
      {
        title: "Departments",
        icon: Building,
        url: "/hrm/departments",
        requiredPermission: "org.departments.view",
      },
      {
        title: "Positions",
        icon: Layers,
        url: "/hrm/positions",
        requiredPermission: "org.designations.view",
      },
    ],
  },
  {
    label: "Settings",
    items: [
      {
        title: "Leave Settings",
        icon: FileSliders,
        url: "/hrm/leave-settings",
        requiredPermission: "hrms.leaveTypes.view",
      },
      {
        title: "Azure Users",
        icon: CloudDownload,
        url: "/hrm/azure-users",
        requiredPermission: "hrms.azure.users.view",
      },
      {
        title: "Roles & Permissions",
        icon: UserLock,
        url: "/hrm/roles-permissions",
        requiredPermission: "identity.roles.view",
      },
    ],
  },
]

export function isHrmNavItemActive(pathname: string, url: string) {
  return pathname === url || pathname.startsWith(`${url}/`)
}

export function getHrmBreadcrumbs(pathname: string): HrmBreadcrumbItem[] {
  const root = { label: "SPUP HRM", href: "/hrm/dashboard" }

  if (pathname === "/hrm" || pathname === "/hrm/dashboard") {
    return [root, { label: "Dashboard" }]
  }
  if (pathname.startsWith("/hrm/job-postings")) {
    return [root, { label: "Recruitment" }, { label: "Job Postings" }]
  }
  if (pathname.startsWith("/hrm/applicants")) {
    return [root, { label: "Recruitment" }, { label: "Applicants" }]
  }
  if (pathname.startsWith("/hrm/employees")) {
    return [root, { label: "Employee Management" }, { label: "Employees" }]
  }
  if (pathname.startsWith("/hrm/profiles/")) {
    return [root, { label: "Employee Management", href: "/hrm/employees" }, { label: "Profile" }]
  }
  if (pathname.startsWith("/hrm/portfolio/")) {
    return [root, { label: "Employee Management", href: "/hrm/employees" }, { label: "Portfolio" }]
  }
  if (pathname === "/hrm/portfolio") {
    return [root, { label: "My Portfolio" }]
  }
  if (pathname.startsWith("/hrm/departments/")) {
    return [
      root,
      { label: "Organization" },
      { label: "Departments", href: "/hrm/departments" },
      { label: "Department" },
    ]
  }
  if (pathname.startsWith("/hrm/departments")) {
    return [root, { label: "Organization" }, { label: "Departments" }]
  }
  if (pathname.startsWith("/hrm/positions")) {
    return [root, { label: "Organization" }, { label: "Positions" }]
  }
  if (pathname.startsWith("/hrm/leave-settings")) {
    return [root, { label: "Settings" }, { label: "Leave Settings" }]
  }
  if (pathname.startsWith("/hrm/azure-users")) {
    return [root, { label: "Settings" }, { label: "Azure Users" }]
  }
  if (pathname.startsWith("/hrm/roles-permissions")) {
    return [root, { label: "Settings" }, { label: "Roles & Permissions" }]
  }
  return [root]
}
