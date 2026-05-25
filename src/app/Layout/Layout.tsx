
import { useState } from "react";

import { SidebarProvider } from "#ui/sidebar";
import { Toaster } from "#ui/sonner";
import { TooltipProvider } from "#ui/tooltip";

import AppSidebar from "./AppSidebar";
import { useTheme } from "./theme-provider";

export default function Layout() {
  const [isOpen, setIsOpen] = useState<boolean>(getSidebarState());
  const { theme } = useTheme();

  function getSidebarState() {
    const cookie = document.cookie.split("; ").find((row) => row.startsWith("sidebar_state="));

    if (!cookie) return true;
    return cookie.split("=")[1] === "true";
  }

  return (
    <SidebarProvider
      open={isOpen}
      onOpenChange={setIsOpen}
      style={
        {
          "--sidebar-width": "13rem",
          "--sidebar-width-mobile": "15rem",
        } as React.CSSProperties
      }
    >
      <AppSidebar />

      <main className="flex max-h-dvh w-full flex-1 flex-col">
        <Toaster
          theme={theme}
          richColors
          position="top-center"
          invert
          offset={{ top: "8px" }}
          duration={10000}
        />
        <div className="h-[calc(100vh-var(--spacing)*16)]">
          <TooltipProvider>
            <Outlet />
          </TooltipProvider>
          {/* <TanStackDevtools
            plugins={[
              {
                name: "TanStack Query",
                render: <ReactQueryDevtoolsPanel />,
              },
              {
                name: "TanStack Router",
                render: <TanStackRouterDevtoolsPanel />,
              },
              {
                name: "TanStack Form",
                render: <FormDevtoolsPanel />,
              },
            ]}
          /> */}
          {/* <Measurer /> */}
        </div>
        <div className="text-muted-foreground absolute right-4 bottom-4 text-right text-xs select-none">
          © 2025-2026 Ben Cheatwood
        </div>
      </main>
    </SidebarProvider>
  );
}
