import { useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useSidebar } from "@/components/ui/sidebar";
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboardIcon,
  StoreIcon,
  PackageIcon,
  LogOutIcon,
} from "lucide-react";

const navItems = [
  {
    title: "Dashboard",
    icon: LayoutDashboardIcon,
    route: "/",
    adminOnly: true,
  },
  {
    title: "POS Register",
    icon: StoreIcon,
    route: "/pos",
    adminOnly: false,
  },
  {
    title: "Inventory",
    icon: PackageIcon,
    route: "/inventory",
    adminOnly: true,
  },
];

function getInitials(name) {
  if (!name) return "?";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export default function AppSidebar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const { state } = useSidebar();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  return (
    <>
    <Sidebar collapsible="icon">
      <SidebarHeader className="px-2 py-0">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" isActive={false} className="group-data-[collapsible=icon]:h-12! group-data-[collapsible=icon]:w-12!">
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <StoreIcon className="size-4" />
              </div>
              {state === "expanded" && (
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">RSL POS</span>
                </div>
              )}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <div className="mx-2 border-t" />

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems
                .filter((item) => !item.adminOnly || user?.role === "admin")
                .map((item) => (
                <SidebarMenuItem key={item.route}>
                  <SidebarMenuButton
                    isActive={location.pathname === item.route}
                    tooltip={item.title}
                    disabled={item.disabled}
                    render={
                      item.disabled ? undefined : <Link to={item.route} />
                    }
                  >
                    <item.icon />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <div className="mx-2 border-t" />

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" className="justify-center">
              <Avatar size="sm">
                <AvatarFallback>
                  {getInitials(user?.display_name || user?.username)}
                </AvatarFallback>
              </Avatar>
              {state === "expanded" && (
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">
                    {user?.display_name || user?.username}
                  </span>
                </div>
              )}
              {state === "expanded" && (
                <LogOutIcon
                  className="size-4 shrink-0 text-muted-foreground hover:text-destructive cursor-pointer ml-auto"
                  onClick={(e) => { e.stopPropagation(); setShowLogoutDialog(true); }}
                />
              )}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>

      {/* Logout Dialog */}
      {showLogoutDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-sm rounded-xl bg-popover p-4 text-popover-foreground shadow-lg ring-1 ring-foreground/10">
            <h2 className="text-base font-semibold">Sign Out</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Are you sure you want to sign out? You will need to log in again.
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowLogoutDialog(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={() => { setShowLogoutDialog(false); logout(); }}>
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
