import React from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  Briefcase,
  ClipboardCheck,
  BarChart3,
} from "lucide-react";

const items = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { icon: Users, label: "Employees", href: "/employees" },
  { icon: Briefcase, label: "Roles", href: "/roles" },
  { icon: ClipboardCheck, label: "Assess", href: "/assessments" },
  { icon: BarChart3, label: "Analytics", href: "/analytics" },
];

export const MobileBottomNav: React.FC = () => {
  const location = useLocation();

  return (
    <nav className="mobile-bottom-nav border-border/50">
      {items.map((item) => {
        const active = location.pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            to={item.href}
            className={cn(
              "flex flex-col items-center gap-0.5 rounded-lg px-3 py-2 text-[10px] font-medium transition-colors touch-target",
              active
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <item.icon className="h-5 w-5" />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
};
