import { Link, useRouteContext } from "@tanstack/react-router";
import {
  Search,
  SquareMenu,
  ListFilter,
  ScanBarcode,
  Logs,
  UserCog2,
  ArrowLeftToLine,
  ArrowRightFromLine,
  ArrowDownUp,
  MessageCircleQuestionMark,
  ArrowLeftRight,
  LayoutDashboard,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroupLabel,
  SidebarHeader,
  useSidebar,
  SidebarFooter,
} from "#ui/sidebar";

import CodeDialog from "#app/CodeLookup/CodeDialog.tsx";
import PPAFDialog from "#app/TechHub/PPAF/PPAFDialog.tsx";
import Preferences from "./Preferences";

export default function AppSidebar() {
  const { auth } = useRouteContext({ from: "/_authenticated" });
  const { metadata } = auth.user!;
  const appRoles = metadata && metadata.approles ? (metadata.approles as string[]) : [];

  const isViewOnly = appRoles.includes("viewonly");
  const isAdmin = appRoles.includes("admin");
  const isInventory = appRoles.includes("inventory");

  const techHubView =
    appRoles.includes("tech") || appRoles.includes("techmanager") || isAdmin || isViewOnly;

  const { toggleSidebar, open } = useSidebar();

  const items = [
    {
      title: "Search Spec Logs",
      url: "/specs",
      icon: Search,
      shown: true,
    },
    {
      title: "Technical Info Links",
      url: "/links",
      icon: SquareMenu,
      shown: true,
    },
    {
      title: "Filter Test Results",
      url: "/filter",
      icon: ListFilter,
      shown: appRoles.includes("rd") || appRoles.includes("rnrmanager") || isAdmin,
    },
  ];

  const inventoryItems = [
    {
      title: "Search NFPs",
      url: "/nfp",
      icon: ArrowDownUp,
      shown: isInventory || isAdmin,
    },
    {
      title: "Search WODs",
      url: "/wod",
      icon: ArrowLeftRight,
      shown: isInventory || isAdmin,
    },
  ];

  const techHubItems = [
    {
      title: "Dashboard",
      url: "/hubdashboard",
      icon: LayoutDashboard,
      shown: techHubView && !isViewOnly,
    },
    {
      title: "Order Scan",
      url: "/scan",
      icon: ScanBarcode,
      shown: techHubView,
    },
  ];

  const adminItems = [
    {
      title: "Audit Log",
      url: "/audit",
      icon: Logs,
      shown: isAdmin,
    },
    {
      title: "User Management",
      url: "/users",
      icon: UserCog2,
      shown: isAdmin,
    },
  ];
  //from-muted dark:from-muted bg-linear-to-b from-10% to-blue-600/70 to-60% pr-px dark:to-blue-500/60
  return (
    <Sidebar variant="floating" collapsible="icon">
      <SidebarContent className="from-bg-background/50 to-background rounded-t-lg bg-linear-to-b to-25%">
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem key="sidebarToggle" className="select-none">
              <SidebarMenuButton onClick={toggleSidebar} className="hover:bg-muted/70">
                {open ? <ArrowLeftToLine /> : <ArrowRightFromLine />}
                <span>Toggle Sidebar</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarGroupLabel className="pointer-events-none select-none">
              Resources
            </SidebarGroupLabel>
            <SidebarMenu>
              {items
                .filter((link) => link.shown)
                .map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      className="hover:bg-muted/70 select-none"
                      render={
                        <Link to={item.url}>
                          <item.icon />
                          <span>{item.title}</span>
                        </Link>
                      }
                    />
                  </SidebarMenuItem>
                ))}
              <CodeDialog />
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        {(isInventory || isAdmin) && (
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarGroupLabel className="pointer-events-none select-none">
                Inventory
              </SidebarGroupLabel>
              <SidebarMenu>
                {inventoryItems
                  .filter((link) => link.shown)
                  .map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        className="hover:bg-muted/70 select-none"
                        render={
                          <Link to={item.url}>
                            <item.icon />
                            <span>{item.title}</span>
                          </Link>
                        }
                      />
                    </SidebarMenuItem>
                  ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
        {techHubView && (
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarGroupLabel className="pointer-events-none select-none">
                Tech Hub
              </SidebarGroupLabel>
              <SidebarMenu>
                {techHubItems
                  .filter((link) => link.shown)
                  .map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        className="hover:bg-muted/70 select-none"
                        render={
                          <Link to={item.url}>
                            <item.icon />
                            <span>{item.title}</span>
                          </Link>
                        }
                      />
                    </SidebarMenuItem>
                  ))}
                {!isViewOnly && <PPAFDialog />}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
        {isAdmin && (
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarGroupLabel className="pointer-events-none select-none">
                Admin
              </SidebarGroupLabel>
              <SidebarMenu>
                {adminItems
                  .filter((link) => link.shown)
                  .map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        className="hover:bg-muted/70 select-none"
                        render={
                          <Link to={item.url}>
                            <item.icon />
                            <span>{item.title}</span>
                          </Link>
                        }
                      />
                    </SidebarMenuItem>
                  ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
      <SidebarFooter className="bg-background rounded-b-lg">
        <SidebarMenu>
          <Preferences />
          <SidebarMenuItem key="support" className="select-none">
            <SidebarMenuButton
              render={
                <a href="slack://user?team=T03FTLVM1&id=U012ZVA0JPR">
                  <MessageCircleQuestionMark />
                  <span>Report an Issue</span>
                </a>
              }
              className="hover:bg-muted/70"
            />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
