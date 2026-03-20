import React from "react";
import { cn } from "@/lib/utils";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
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
  ClipboardCheck,
  BookOpen,
  BarChart3,
  AlertTriangle,
  Settings,
  Bot,
  Wrench,
} from "lucide-react";

const mainNav = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Employees", url: "/employees", icon: Users },
  { title: "Assessments", url: "/assessments", icon: ClipboardCheck },
  { title: "Competencies", url: "/competencies", icon: BookOpen },
  { title: "Skills Matrix", url: "/skills-matrix", icon: BarChart3 },
];

const toolsNav = [
  { title: "AI Insights", url: "/ai-insights", icon: Bot },
  { title: "Gap Analysis", url: "/gap-analysis", icon: AlertTriangle },
  { title: "Equipment", url: "/equipment", icon: Wrench },
];

const systemNav = [
  { title: "Settings", url: "/settings", icon: Settings },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  const renderGroup = (label: string, items: typeof mainNav) => (
    <SidebarGroup key={label}>
      {!collapsed && <SidebarGroupLabel className="text-xs uppercase tracking-wider text-muted-foreground/70">{label}</SidebarGroupLabel>}
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild>
                <NavLink
                  to={item.url}
                  end={item.url === "/"}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all duration-150",
                    "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                    isActive(item.url) && "bg-primary/10 text-primary font-medium"
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
  );

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm">
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
        {renderGroup("Main", mainNav)}
        {renderGroup("Tools", toolsNav)}
        {renderGroup("System", systemNav)}
      </SidebarContent>
      <SidebarFooter className="p-4 border-t border-sidebar-border">
        {!collapsed && (
          <p className="text-xs text-muted-foreground/50">v1.0.0</p>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
