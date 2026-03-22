import { LevelIndicator } from "@/components/LevelIndicator";
import { StatusBadge } from "@/components/StatusBadge";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { EmployeeDetail } from "@/services/employeeDetail";

interface CompetencyTabProps {
  employee: EmployeeDetail;
}

export const CompetencyTab: React.FC<CompetencyTabProps> = ({ employee }) => {
  const { competency_summary: summary, competencies } = employee;

  const readinessColor =
    summary.readiness_percentage >= 80
      ? "text-success"
      : summary.readiness_percentage >= 50
        ? "text-warning"
        : "text-destructive";

  const progressColor =
    summary.readiness_percentage >= 80
      ? "[&>div]:bg-success"
      : summary.readiness_percentage >= 50
        ? "[&>div]:bg-warning"
        : "[&>div]:bg-destructive";

  return (
    <div className="space-y-6">
      {/* Summary stats */}
      <div className="glass rounded-card p-5">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold">{summary.total}</p>
            <p className="text-xs text-muted-foreground">Total Required</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold">{summary.assessed}</p>
            <p className="text-xs text-muted-foreground">Assessed</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-destructive">{summary.gaps}</p>
            <p className="text-xs text-muted-foreground">Gaps</p>
          </div>
          <div className="text-center">
            <p className={cn("text-2xl font-bold", readinessColor)}>
              {summary.readiness_percentage}%
            </p>
            <p className="text-xs text-muted-foreground mb-2">Readiness</p>
            <Progress value={summary.readiness_percentage} className={cn("h-2", progressColor)} />
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
              {competencies.map((comp) => (
                <tr key={comp.competency_id} className="border-b border-border/30 last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 font-medium">{comp.competency_name}</td>
                  <td className="px-4 py-3">
                    <StatusBadge variant="neutral">{comp.category}</StatusBadge>
                  </td>
                  <td className="px-4 py-3">
                    <LevelIndicator level={comp.required_level} size="sm" />
                  </td>
                  <td className="px-4 py-3">
                    {comp.assessed_level !== null ? (
                      <LevelIndicator level={comp.assessed_level} size="sm" />
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
                    {comp.safety_critical && (
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
