import { AppSidebar } from "./app-sidebar"
import { AppTopbar } from "./app-topbar"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { TooltipProvider } from "@/components/ui/tooltip"

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <TooltipProvider>
      <SidebarProvider>
        <a
          href="#main-content"
          className="fixed top-4 left-4 z-60 -translate-y-20 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground shadow-md transition-transform focus:translate-y-0"
        >
          Skip to main content
        </a>
        <AppSidebar />

        <SidebarInset className="print:w-full">
          <div className="min-h-screen bg-muted/30 print:bg-white">
            <AppTopbar />

            <main
              id="main-content"
              tabIndex={-1}
              className="w-full p-4 print:p-0 md:p-5 lg:p-6"
            >
              {children}
            </main>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  )
}
