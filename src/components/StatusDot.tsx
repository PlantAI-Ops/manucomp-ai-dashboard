import React from "react";
import { cn } from "@/lib/utils";

type DotVariant = "success" | "warning" | "danger" | "info" | "neutral";

const dotColors: Record<DotVariant, string> = {
  success: "bg-success",
  warning: "bg-warning",
  danger: "bg-destructive",
  info: "bg-info",
  neutral: "bg-muted-foreground",
};

interface StatusDotProps {
  variant?: DotVariant;
  pulse?: boolean;
  className?: string;
}

export const StatusDot: React.FC<StatusDotProps> = ({
  variant = "neutral",
  pulse = false,
  className,
}) => {
  return (
    <span className={cn("relative inline-flex h-2.5 w-2.5 rounded-full", dotColors[variant], className)}>
      {pulse && (
        <span
          className={cn(
            "absolute inset-0 rounded-full animate-ping opacity-40",
            dotColors[variant]
          )}
        />
      )}
    </span>
  );
};
