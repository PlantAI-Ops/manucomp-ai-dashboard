import { StatusBadge } from "@/components/StatusBadge";
import { LevelIndicator } from "@/components/LevelIndicator";
import { Skeleton } from "@/components/ui/skeleton";
import { ClipboardList } from "lucide-react";
import { format } from "date-fns";
import {
  useAssessments,
  buildMockAssessments,
  type AssessmentRecord,
} from "@/services/employeeDetail";

interface AssessmentHistoryTabProps {
  employeeId: string;
}

const typeVariant = (t: string) => {
  switch (t) {
    case "Initial": return "info";
    case "Annual": return "success";
    case "Spot Check": return "warning";
    default: return "neutral";
  }
};

export const AssessmentHistoryTab: React.FC<AssessmentHistoryTabProps> = ({ employeeId }) => {
  const { data: apiData, isLoading, isError } = useAssessments(employeeId);
  const assessments: AssessmentRecord[] = apiData ?? (isError ? buildMockAssessments(employeeId) : []);

  if (isLoading) {
    return (
      <div className="glass rounded-card p-4 space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full bg-muted" />
        ))}
      </div>
    );
  }

  if (assessments.length === 0) {
    return (
      <div className="glass rounded-card flex flex-col items-center justify-center py-16 text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
          <ClipboardList className="h-6 w-6" />
        </div>
        <h3 className="text-base font-medium">No assessments yet</h3>
        <p className="mt-1 text-sm text-muted-foreground">Assessments will appear here once completed</p>
      </div>
    );
  }

  return (
    <div className="glass rounded-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/50">
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Competency</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Level</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Assessor</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Type</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Date</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Notes</th>
            </tr>
          </thead>
          <tbody>
            {assessments.map((a) => (
              <tr key={a.id} className="border-b border-border/30 last:border-0 hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3 font-medium">{a.competency_name}</td>
                <td className="px-4 py-3"><LevelIndicator level={a.level} size="sm" /></td>
                <td className="px-4 py-3 text-muted-foreground">{a.assessor_name}</td>
                <td className="px-4 py-3">
                  <StatusBadge variant={typeVariant(a.assessment_type) as any}>{a.assessment_type}</StatusBadge>
                </td>
                <td className="px-4 py-3 text-muted-foreground tabular-nums">
                  {format(new Date(a.assessed_at), "MMM d, yyyy")}
                </td>
                <td className="px-4 py-3 text-muted-foreground text-xs max-w-[200px] truncate">
                  {a.notes || "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
