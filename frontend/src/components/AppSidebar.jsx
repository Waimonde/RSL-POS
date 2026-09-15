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
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  LayoutDashboardIcon,
  PackageIcon,
  ShoppingCartIcon,
  UsersIcon,
  BarChart3Icon,
  StoreIcon,
} from "lucide-react";

const navItems = [
  {
    title: "Dashboard",
    icon: LayoutDashboardIcon,
    route: "/",
    disabled: false,
  },
  { title: "Products", icon: PackageIcon, route: "/products", disabled: true },
  { title: "Sales", icon: ShoppingCartIcon, route: "/sales", disabled: true },
  { title: "Customers", icon: UsersIcon, route: "/customers", disabled: true },
  { title: "Reports", icon: BarChart3Icon, route: "/reports", disabled: true },
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
  const { user } = useAuth();
  const location = useLocation();
  const { state } = useSidebar();

  return (
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
              {navItems.map((item) => (
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
                  {user?.role === "admin" && (
                    <Badge
                      variant="secondary"
                      className="mt-0.5 w-fit text-[10px] capitalize"
                    >
                      {user.role}
                    </Badge>
                  )}
                </div>
              )}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
