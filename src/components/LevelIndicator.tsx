import React from "react";
import { cn } from "@/lib/utils";

interface LevelIndicatorProps {
  level: number;
  maxLevel?: number;
  size?: "sm" | "md";
  className?: string;
}

const levelColors = [
  "bg-muted-foreground/30",
  "bg-destructive",
  "bg-warning",
  "bg-warning",
  "bg-success",
  "bg-primary",
];

export const LevelIndicator: React.FC<LevelIndicatorProps> = ({
  level,
  maxLevel = 5,
  size = "md",
  className,
}) => {
  const dotSize = size === "sm" ? "h-1.5 w-1.5" : "h-2.5 w-2.5";

  return (
    <div className={cn("flex items-center gap-1", className)}>
      {Array.from({ length: maxLevel }, (_, i) => {
        const filled = i < level;
        return (
          <span
            key={i}
            className={cn(
              "rounded-full transition-colors duration-200",
              dotSize,
              filled ? levelColors[Math.min(level, levelColors.length - 1)] : "bg-muted"
            )}
          />
        );
      })}
      <span className="ml-1 text-xs tabular-nums text-muted-foreground">
        {level}/{maxLevel}
      </span>
    </div>
  );
};
