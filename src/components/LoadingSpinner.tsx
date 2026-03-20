import React from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface LoadingSpinnerProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  fullPage?: boolean;
}

const sizeMap = { sm: "h-4 w-4", md: "h-6 w-6", lg: "h-10 w-10" };

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  className,
  size = "md",
  fullPage = false,
}) => {
  const spinner = (
    <Loader2 className={cn("animate-spin text-primary", sizeMap[size], className)} />
  );

  if (fullPage) {
    return (
      <div className="flex h-full min-h-[50vh] items-center justify-center">
        {spinner}
      </div>
    );
  }

  return spinner;
};
