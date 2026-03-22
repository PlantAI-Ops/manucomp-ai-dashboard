import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Sparkles, AlertTriangle, Lightbulb, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  generateAiInsight,
  MOCK_AI_INSIGHT,
  type AiInsightResponse,
} from "@/services/employeeDetail";

interface AiInsightsTabProps {
  employeeId: string;
}

export const AiInsightsTab: React.FC<AiInsightsTabProps> = ({ employeeId }) => {
  const [insight, setInsight] = useState<AiInsightResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const data = await generateAiInsight(employeeId);
      setInsight(data);
      setGenerated(true);
    } catch (err: any) {
      if (err?.response?.status === 501) {
        // Fallback to mock
        setInsight(MOCK_AI_INSIGHT);
        setGenerated(true);
        toast.info("Using sample AI insights (API coming soon)");
      } else {
        toast.error("Failed to generate insights");
      }
    } finally {
      setLoading(false);
    }
  };

  if (!generated && !loading) {
    return (
      <div className="glass rounded-card flex flex-col items-center justify-center py-16 text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/15 text-primary">
          <Sparkles className="h-6 w-6" />
        </div>
        <h3 className="text-base font-medium">AI-Powered Insights</h3>
        <p className="mt-1 mb-4 text-sm text-muted-foreground max-w-md">
          Generate personalized development insights, recommendations, and priority actions based on competency data.
        </p>
        <Button onClick={handleGenerate}>
          <Sparkles className="mr-2 h-4 w-4" /> Generate AI Insights
        </Button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="glass rounded-card p-6 space-y-3">
          <Skeleton className="h-5 w-40 bg-muted" />
          <Skeleton className="h-4 w-full bg-muted" />
          <Skeleton className="h-4 w-3/4 bg-muted" />
        </div>
        <div className="glass rounded-card p-6 space-y-3">
          <Skeleton className="h-5 w-48 bg-muted" />
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-4 w-full bg-muted" />
          ))}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full bg-muted rounded-card" />
          ))}
        </div>
      </div>
    );
  }

  if (!insight) return null;

  const severityStyles = {
    critical: "border-destructive/40 bg-destructive/10",
    high: "border-warning/40 bg-warning/10",
    medium: "border-primary/40 bg-primary/10",
  };

  const severityIcon = {
    critical: <AlertTriangle className="h-4 w-4 text-destructive shrink-0" />,
    high: <AlertTriangle className="h-4 w-4 text-warning shrink-0" />,
    medium: <Zap className="h-4 w-4 text-primary shrink-0" />,
  };

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Summary */}
      <div className="glass rounded-card p-6">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="h-4 w-4 text-primary" />
          <h3 className="font-semibold">Summary</h3>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">{insight.summary}</p>
      </div>

      {/* Recommendations */}
      <div className="glass rounded-card p-6">
        <div className="flex items-center gap-2 mb-3">
          <Lightbulb className="h-4 w-4 text-warning" />
          <h3 className="font-semibold">Recommendations</h3>
        </div>
        <ul className="space-y-2">
          {insight.recommendations.map((rec, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
              <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
              {rec}
            </li>
          ))}
        </ul>
      </div>

      {/* Priority actions */}
      <div>
        <h3 className="font-semibold mb-3">Priority Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {insight.priority_actions.map((action, i) => (
            <div
              key={i}
              className={cn(
                "rounded-card border p-4 flex items-start gap-3",
                severityStyles[action.severity]
              )}
            >
              {severityIcon[action.severity]}
              <div>
                <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  {action.severity}
                </span>
                <p className="text-sm mt-0.5">{action.action}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end">
        <Button variant="outline" size="sm" onClick={handleGenerate} disabled={loading}>
          <Sparkles className="mr-1 h-3.5 w-3.5" /> Regenerate
        </Button>
      </div>
    </div>
  );
};
