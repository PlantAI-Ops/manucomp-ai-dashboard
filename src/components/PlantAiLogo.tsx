import React from "react";
import { cn } from "@/lib/utils";

interface PlantAiLogoProps {
  className?: string;
  size?: number;
}

/**
 * PlantAI logomark — isometric cube with green sensor nodes.
 * Inspired by connected industrial infrastructure.
 */
export const PlantAiLogo: React.FC<PlantAiLogoProps> = ({ className, size = 32 }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0", className)}
      aria-hidden="true"
    >
      <path d="M20 6 L32 12 L20 18 L8 12 Z" fill="hsl(var(--secondary))" />
      <path d="M8 12 L20 18 L20 32 L8 26 Z" fill="hsl(var(--foreground))" />
      <path d="M32 12 L32 26 L20 32 L20 18 Z" fill="hsl(var(--secondary))" opacity="0.75" />
      <circle cx="8" cy="12" r="2.2" fill="hsl(var(--accent))" />
      <circle cx="32" cy="12" r="2.2" fill="hsl(var(--accent))" />
      <circle cx="20" cy="32" r="2.2" fill="hsl(var(--accent))" />
      <line x1="8" y1="12" x2="20" y2="18" stroke="hsl(var(--accent))" strokeWidth="1" opacity="0.6" />
      <line x1="32" y1="12" x2="20" y2="18" stroke="hsl(var(--accent))" strokeWidth="1" opacity="0.6" />
    </svg>
  );
};