import React, { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { useAuth } from "@/hooks/useAuth";
import { StatusBadge } from "@/components/StatusBadge";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Bell, Search, User, LogOut, Settings } from "lucide-react";

interface AppLayoutProps {
  children: React.ReactNode;
}

const roleBadgeVariant = (role: string) => {
  switch (role) {
    case "admin":
      return "danger" as const;
    case "manager":
      return "warning" as const;
    default:
      return "info" as const;
  }
};

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [search, setSearch] = useState("");

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const initials = user?.full_name
    ? user.full_name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "?";

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        {/* Sidebar hidden on mobile, visible on sm+ */}
        <div className="hidden sm:block">
          <AppSidebar />
        </div>
        <div className="flex-1 flex flex-col min-w-0">
          {/* Top bar */}
          <header className="sticky top-0 z-30 flex h-14 sm:h-16 items-center gap-2 sm:gap-4 border-b border-border/50 bg-background/80 backdrop-blur-md px-3 sm:px-4">
            {/* Left: sidebar trigger + app name */}
            <div className="flex items-center gap-2 sm:gap-3">
              <SidebarTrigger className="hidden sm:flex text-muted-foreground hover:text-foreground transition-colors" />
              <span className="text-sm font-semibold text-foreground">
                ManuComp <span className="text-primary">AI</span>
              </span>
            </div>

            {/* Center: search — hidden on small mobile */}
            <div className="flex-1 max-w-md mx-auto hidden sm:block">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search employees, roles, competencies…"
                  className="pl-9 bg-muted/50 border-border/50 rounded-input h-9 text-sm"
                />
              </div>
            </div>

            {/* Right: notifications + user */}
            <div className="flex items-center gap-1 sm:gap-2 ml-auto">
              {/* Notification bell */}
              <button className="relative flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors active:scale-95 touch-target">
                <Bell className="h-4 w-4" />
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-destructive" />
              </button>

              {/* User dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/15 text-primary text-xs font-semibold hover:bg-primary/25 transition-colors active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring touch-target">
                    {initials}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="glass w-56">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col gap-1">
                      <p className="text-sm font-medium">{user?.full_name || "User"}</p>
                      <StatusBadge variant={roleBadgeVariant(user?.role || "employee")} className="w-fit">
                        {user?.role || "employee"}
                      </StatusBadge>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/settings" className="flex items-center gap-2 cursor-pointer">
                      <Settings className="h-4 w-4" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="flex items-center gap-2 cursor-pointer text-destructive focus:text-destructive"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>

          <main className="flex-1 p-3 sm:p-6 overflow-auto pb-20 sm:pb-6">
            <div key={location.pathname} className="page-transition">
              {children}
            </div>
          </main>
        </div>

        {/* Mobile bottom navigation */}
        <MobileBottomNav />
      </div>
    </SidebarProvider>
  );
};
