import { AppSidebar } from "./app-sidebar"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { TooltipProvider } from "@/components/ui/tooltip"
import { AppTopbar } from "./app-topbar"

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <TooltipProvider>
      <SidebarProvider>
        <AppSidebar />

        <SidebarInset>
        <AppTopbar />
        
          <div className="min-h-screen w-full bg-muted/30">
            <main className="w-full p-4 md:p-6">
              {children}
            </main>
          </div>
        </SidebarInset>
        
      </SidebarProvider>
    </TooltipProvider>
  )
}
