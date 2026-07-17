import React from "react";
import { PlantAiLogo } from "@/components/PlantAiLogo";
import { ThemeToggle } from "@/components/ThemeToggle";

interface AuthLayoutProps {
  children: React.ReactNode;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-12">
      {/* Subtle industrial grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          backgroundImage:
            "linear-gradient(hsl(var(--border) / 0.6) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--border) / 0.6) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
          maskImage: "radial-gradient(ellipse 70% 60% at 50% 40%, black, transparent)",
          WebkitMaskImage: "radial-gradient(ellipse 70% 60% at 50% 40%, black, transparent)",
        }}
      />

      <div className="absolute top-4 right-4 z-20">
        <ThemeToggle />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="mb-8 flex flex-col items-center text-center animate-fade-in">
          <PlantAiLogo size={48} className="mb-4" />
          <h1 className="text-xl font-semibold tracking-tight text-foreground">
            PlantAI
          </h1>
          <p className="mt-1 text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
            Ops &amp; Automation
          </p>
          <p className="mt-3 text-sm text-muted-foreground">
            Industrial competency intelligence
          </p>
        </div>

        <div
          className="rounded-card border border-border bg-card p-8 shadow-md animate-fade-in"
          style={{ animationDelay: "80ms" }}
        >
          {children}
        </div>

        <p className="mt-6 text-center text-[11px] uppercase tracking-widest text-muted-foreground/70">
          Enterprise · Secure · Operational
        </p>
      </div>
    </div>
  );
};
