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
        
          <div className="min-h-screen bg-muted/30">
            <main className="p-4 md:p-6">
              <div className="mx-auto w-full max-w-7xl">
                {children}
              </div>
            </main>
          </div>
        </SidebarInset>
        
      </SidebarProvider>
    </TooltipProvider>
  )
}
