import React from "react";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  trend?: { direction: "up" | "down" | "neutral"; value: string };
  iconClassName?: string;
  className?: string;
}

const trendConfig = {
  up: { icon: TrendingUp, color: "text-success" },
  down: { icon: TrendingDown, color: "text-destructive" },
  neutral: { icon: Minus, color: "text-muted-foreground" },
};

export const StatCard = React.forwardRef<HTMLDivElement, StatCardProps>(
  ({ icon, label, value, trend, iconClassName, className }, ref) => {
    const TrendIcon = trend ? trendConfig[trend.direction].icon : null;
    const trendColor = trend ? trendConfig[trend.direction].color : "";

    return (
      <div
        ref={ref}
        className={cn(
          "glass glass-hover rounded-card p-5 transition-all duration-200 active:scale-[0.98]",
          className
        )}
      >
        <div className="flex items-start justify-between">
          <div className={cn("flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary", iconClassName)}>
            {icon}
          </div>
          {trend && TrendIcon && (
            <div className={cn("flex items-center gap-1 text-xs font-medium", trendColor)}>
              <TrendIcon className="h-3.5 w-3.5" />
              {trend.value}
            </div>
          )}
        </div>
        <div className="mt-4">
          <p className="text-2xl font-semibold tabular-nums tracking-tight">{value}</p>
          <p className="mt-0.5 text-sm text-muted-foreground">{label}</p>
        </div>
      </div>
    );
  }
);
StatCard.displayName = "StatCard";
