import React, { useMemo } from "react";
import { cn } from "@/lib/utils";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { PlantAiLogo } from "@/components/PlantAiLogo";
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
  ShieldAlert,
  Settings,
  Building2,
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
  { title: "Departments", url: "/departments", icon: Building2 },
  { title: "Roles", url: "/roles", icon: Briefcase },
  { title: "Competencies", url: "/competencies", icon: Award },
  { title: "Assessments", url: "/assessments", icon: ClipboardCheck },
  { title: "Analytics", url: "/analytics", icon: BarChart3 },
  { title: "AI Assistant", url: "/ai", icon: Sparkles, roles: ["admin", "manager"] },
  { title: "Audit Log", url: "/audit", icon: ShieldAlert, roles: ["admin"] },
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
    <Sidebar collapsible="icon" className="border-r border-sidebar-border bg-sidebar">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-2.5">
          <PlantAiLogo size={28} />
          {!collapsed && (
            <div className="flex flex-col leading-tight">
              <span className="text-sm font-semibold tracking-tight text-sidebar-foreground">PlantAI</span>
              <span className="text-[9px] font-medium uppercase tracking-[0.18em] text-muted-foreground mt-0.5">
                Ops &amp; Automation
              </span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2">
        <SidebarGroup>
          {!collapsed && (
            <SidebarGroupLabel className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/70 px-3">
              Operations
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
                        "relative flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-all duration-150",
                        "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                        isActive(item.url)
                          ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                          : "text-sidebar-foreground"
                      )}
                      activeClassName=""
                    >
                      {isActive(item.url) && (
                        <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-[3px] bg-accent rounded-r-full" />
                      )}
                      <item.icon className={cn("h-4 w-4 shrink-0", isActive(item.url) && "text-accent")} />
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
          <div className="flex items-center gap-2 text-[11px] text-muted-foreground/70">
            <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
            <span>Systems nominal</span>
            <span className="ml-auto tabular-nums">v1.0.0</span>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
