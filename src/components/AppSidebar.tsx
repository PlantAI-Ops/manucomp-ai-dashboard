import React, { useMemo } from "react";
import { cn } from "@/lib/utils";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  Users,
  Briefcase,
  Award,
  ClipboardCheck,
  BarChart3,
  Sparkles,
  Settings,
} from "lucide-react";

interface NavItem {
  title: string;
  url: string;
  icon: React.FC<{ className?: string }>;
  roles?: Array<"admin" | "manager" | "employee">;
}

const navItems: NavItem[] = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Employees", url: "/employees", icon: Users },
  { title: "Roles", url: "/roles", icon: Briefcase },
  { title: "Competencies", url: "/competencies", icon: Award },
  { title: "Assessments", url: "/assessments", icon: ClipboardCheck },
  { title: "Analytics", url: "/analytics", icon: BarChart3, roles: ["admin", "manager"] },
  { title: "AI Assistant", url: "/ai", icon: Sparkles, roles: ["admin", "manager"] },
  { title: "Settings", url: "/settings", icon: Settings, roles: ["admin"] },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const { user } = useAuth();
  const userRole = user?.role || "employee";

  const visibleItems = useMemo(
    () => navItems.filter((item) => !item.roles || item.roles.includes(userRole)),
    [userRole]
  );

  const isActive = (path: string) => location.pathname === path;

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm shrink-0">
            M
          </div>
          {!collapsed && (
            <div>
              <span className="text-sm font-semibold text-foreground">ManuComp</span>
              <span className="ml-0.5 text-xs font-medium text-primary">AI</span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2">
        <SidebarGroup>
          {!collapsed && (
            <SidebarGroupLabel className="text-xs uppercase tracking-wider text-muted-foreground/70">
              Navigation
            </SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            <SidebarMenu>
              {visibleItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all duration-150",
                        "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                        isActive(item.url)
                          ? "bg-primary/10 text-primary font-medium border-l-2 border-primary"
                          : "border-l-2 border-transparent"
                      )}
                      activeClassName=""
                    >
                      <item.icon className="h-4 w-4 shrink-0" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-sidebar-border">
        {!collapsed && (
          <p className="text-xs text-muted-foreground/50">v1.0.0</p>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
