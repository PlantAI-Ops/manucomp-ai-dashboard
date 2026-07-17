import { LevelIndicator } from "@/components/LevelIndicator";
import { StatusBadge } from "@/components/StatusBadge";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { CompetencySummaryItem, EmployeeCompetencyHistoryItem } from "@/services/employeeDetail";

type CompetencyItem = CompetencySummaryItem | EmployeeCompetencyHistoryItem;

interface CompetencySummary {
  total_required: number;
  assessed: number;
  gaps: number;
}

interface CompetencyTabProps {
  competencies: CompetencyItem[];
  summary?: CompetencySummary;
  isLoading?: boolean;
}

function getAssessedLevel(comp: CompetencyItem): number | null {
  return "assessed_level" in comp ? comp.assessed_level : comp.latest_assessed_level;
}

function getSafetyCritical(comp: CompetencyItem): boolean {
  return "safety_critical" in comp ? comp.safety_critical : comp.is_safety_critical;
}

export const CompetencyTab: React.FC<CompetencyTabProps> = ({ competencies = [], summary, isLoading }) => {

  const readinessPercentage = summary?.total_required
    ? Math.round(((summary.total_required - summary.gaps) / summary.total_required) * 100)
    : competencies.length > 0
      ? Math.round(((competencies.length - competencies.filter((c) => c.gap > 0).length) / competencies.length) * 100)
      : 0;

  const readinessColor = readinessPercentage >= 80 ? "text-success" : readinessPercentage >= 60 ? "text-warning" : "text-destructive";
  const progressColor = readinessPercentage >= 80 ? "bg-success" : readinessPercentage >= 60 ? "bg-warning" : "bg-destructive";

  const displaySummary = summary || {
    total_required: competencies.length,
    assessed: competencies.filter((c) => getAssessedLevel(c) !== null).length,
    gaps: competencies.filter((c) => c.gap > 0).length,
  };

  return (
    <div className="space-y-6">
      {/* Summary stats */}
      <div className="glass rounded-card p-5">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold">{displaySummary.total_required}</p>
            <p className="text-xs text-muted-foreground">Total Required</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold">{displaySummary.assessed}</p>
            <p className="text-xs text-muted-foreground">Assessed</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-destructive">{displaySummary.gaps}</p>
            <p className="text-xs text-muted-foreground">Gaps</p>
          </div>
          <div className="text-center">
            <p className={cn("text-2xl font-bold", readinessColor)}>
              {readinessPercentage}%
            </p>
            <p className="text-xs text-muted-foreground mb-2">Readiness</p>
            <Progress value={readinessPercentage} className={cn("h-2", progressColor)} />
          </div>
        </div>
      </div>

      {/* Competency matrix */}
      <div className="glass rounded-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/50">
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Competency</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Category</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Required</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Assessed</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Gap</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Safety</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-border/30">
                    <td className="px-4 py-3"><Skeleton className="h-4 w-3/4" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-4 w-1/2" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-4 w-1/4" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-4 w-1/4" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-4 w-1/4" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-4 w-1/4" /></td>
                  </tr>
                ))
              ) : competencies.map((comp) => (
                <tr key={comp.competency_id} className="border-b border-border/30 last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 font-medium">{comp.competency_name}</td>
                  <td className="px-4 py-3">
                    <StatusBadge variant="neutral">{comp.category}</StatusBadge>
                  </td>
                  <td className="px-4 py-3">
                    <LevelIndicator level={comp.required_level ?? 0} size="sm" />
                  </td>
                  <td className="px-4 py-3">
                    {getAssessedLevel(comp) !== null ? (
                      <LevelIndicator level={getAssessedLevel(comp)!} size="sm" />
                    ) : (
                      <span className="text-xs text-muted-foreground italic">Not Assessed</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        "inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold",
                        comp.gap === 0
                          ? "bg-success/15 text-success"
                          : comp.gap <= 2
                            ? "bg-warning/15 text-warning"
                            : "bg-destructive/15 text-destructive"
                      )}
                    >
                      {comp.gap}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {getSafetyCritical(comp) && (
                      <AlertTriangle className="h-4 w-4 text-warning" />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
