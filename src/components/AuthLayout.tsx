import React from "react";
import { Cog, Sparkles } from "lucide-react";

interface AuthLayoutProps {
  children: React.ReactNode;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-12">
      {/* Animated grid background */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(hsla(217, 91%, 60%, 0.04) 1px, transparent 1px), linear-gradient(90deg, hsla(217, 91%, 60%, 0.04) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />
      {/* Radial gradient glow */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_-10%,hsla(217,91%,60%,0.12),transparent)]" />

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center text-center animate-fade-in">
          <div className="relative mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/15">
            <Cog className="h-7 w-7 text-primary" />
            <Sparkles className="absolute -right-1 -top-1 h-4 w-4 text-warning" />
          </div>
          <h1 className="text-xl font-semibold tracking-tight">
            ManuComp <span className="text-primary">AI</span>
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">AI-Powered Competency Management</p>
        </div>

        {/* Card */}
        <div className="glass rounded-card p-8 animate-fade-in" style={{ animationDelay: "80ms" }}>
          {children}
        </div>
      </div>
    </div>
  );
};
