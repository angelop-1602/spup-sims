"use client"

import Link from "next/link"
import {
  LayoutDashboard,
  IdCard,
  ClipboardList,
  FileText,
  Settings,
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

type NavItem = {
  title: string
  icon: React.ElementType
  url: string
}

const mainItems: NavItem[] = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    url: "/applicant/dashboard",
  },
  {
    title: "My Profile",
    icon: IdCard,
    url: "#",
  },
]

const applicantItems: NavItem[] = [
  {
    title: "Submissions",
    icon: ClipboardList,
    url: "#",
  },
  {
    title: "Documents",
    icon: FileText,
    url: "#",
  },
]

function NavGroup({
  label,
  items,
}: {
  label: string
  items: NavItem[]
}) 
  {
  return (
    <SidebarGroup>
      <SidebarGroupLabel className="text-muted-foreground">{label}</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild tooltip={item.title}>
                <Link href={item.url}>
                  <item.icon />
                  <span className="font-normal text-sm">{item.title}</span>
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
  return (
    <Sidebar collapsible="icon" className="border-r">
      <SidebarHeader>
        <div className="flex h-14 items-center px-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            HR
          </div>

          <div className="ml-3 group-data-[collapsible=icon]:hidden">
            <p className="text-sm font-semibold">SPUP SIMS</p>
            <p className="text-xs text-muted-foreground">Applicant Portal</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <NavGroup label="Main" items={mainItems} />
        <NavGroup label="Applicant Documents" items={applicantItems} />
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
