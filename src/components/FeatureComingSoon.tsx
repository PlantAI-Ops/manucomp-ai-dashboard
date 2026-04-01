import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface FeatureComingSoonProps {
  title?: string;
  description?: string;
  className?: string;
}

export const FeatureComingSoon: React.FC<FeatureComingSoonProps> = ({
  title = "Feature Coming Soon",
  description = "This feature is currently under development and will be available in a future update.",
  className,
}) => (
  <Card className={cn("glass border-border/40 animate-fade-in", className)}>
    <CardContent className="flex flex-col items-center justify-center py-12 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <Sparkles className="h-7 w-7" />
      </div>
      <h3 className="text-base font-semibold text-foreground">{title}</h3>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">{description}</p>
      <div className="mt-4 flex items-center gap-1.5 text-xs text-muted-foreground/60">
        <Clock className="h-3.5 w-3.5" />
        Expected in upcoming release
      </div>
    </CardContent>
  </Card>
);
