import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LevelIndicator } from "@/components/LevelIndicator";
import { StatusBadge } from "@/components/StatusBadge";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export interface AssessmentDetail {
  id: string;
  employee_id: string;
  employee_name: string;
  competency_id: string;
  competency_name: string;
  competency_category?: string;
  assessed_level: number;
  assessor_type: string;
  assessor_id: string;
  assessor_name: string;
  notes: string | null;
  evidence: string | null;
  assessed_at: string;
  created_at?: string;
  updated_at?: string;
}

interface AssessmentDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  assessment: AssessmentDetail | null;
}

const ASSESSOR_TYPE_VARIANTS: Record<string, "info" | "success" | "neutral" | "warning" | "danger"> = {
  self: "info",
  supervisor: "success",
  peer: "warning",
  external: "neutral",
};

const CATEGORY_COLORS: Record<string, string> = {
  technical: "bg-info/10 text-info border-info/20",
  soft_skills: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  safety: "bg-destructive/10 text-destructive border-destructive/20",
  regulatory: "bg-warning/10 text-warning border-warning/20",
  process: "bg-secondary/10 text-secondary border-secondary/20",
};

export const AssessmentDetailModal = ({ open, onOpenChange, assessment }: AssessmentDetailModalProps) => {
  if (!open || !assessment) return null;

  const cat = assessment.competency_category || "technical";
  const catColor = CATEGORY_COLORS[cat] || CATEGORY_COLORS.technical;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fade-in">
      <div className="glass w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-slide-up">
        <CardHeader className="flex items-center justify-between border-b border-border/50 p-4">
          <CardTitle className="text-lg">Assessment Details</CardTitle>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onOpenChange(false)}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="p-4 space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Employee</p>
              <p className="font-medium">{assessment.employee_name}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Employee ID</p>
              <p className="font-mono text-sm">{assessment.employee_id}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Competency</p>
              <div className="flex items-center gap-2">
                <span className="font-medium">{assessment.competency_name}</span>
                <span className={cn("inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium capitalize", catColor)}>
                  {cat.replace("_", " ")}
                </span>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Competency ID</p>
              <p className="font-mono text-sm">{assessment.competency_id}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Assessed Level</p>
              <LevelIndicator level={assessment.assessed_level} size="md" />
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Assessor</p>
              <p className="font-medium">{assessment.assessor_name}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Assessor Type</p>
              <StatusBadge variant={ASSESSOR_TYPE_VARIANTS[assessment.assessor_type] || "neutral"}>
                {assessment.assessor_type.charAt(0).toUpperCase() + assessment.assessor_type.slice(1)}
              </StatusBadge>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Assessor ID</p>
              <p className="font-mono text-sm">{assessment.assessor_id}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Assessment Date</p>
              <p>{format(new Date(assessment.assessed_at), "MMM d, yyyy HH:mm")}</p>
            </div>
            {assessment.created_at && (
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Created</p>
                <p>{format(new Date(assessment.created_at), "MMM d, yyyy HH:mm")}</p>
              </div>
            )}
            {assessment.updated_at && assessment.updated_at !== assessment.created_at && (
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Last Updated</p>
                <p>{format(new Date(assessment.updated_at), "MMM d, yyyy HH:mm")}</p>
              </div>
            )}
          </div>

          {assessment.notes && (
            <div className="space-y-2 pt-4 border-t border-border/50">
              <p className="text-xs text-muted-foreground">Notes</p>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{assessment.notes}</p>
            </div>
          )}

          {assessment.evidence && (
            <div className="space-y-2 pt-4 border-t border-border/50">
              <p className="text-xs text-muted-foreground">Evidence</p>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{assessment.evidence}</p>
            </div>
          )}

          <div className="pt-4 border-t border-border/50 text-center text-xs text-muted-foreground">
            <p>Assessment ID: <span className="font-mono">{assessment.id}</span></p>
            <p className="mt-1">Note: Update history/audit trail requires backend implementation of an assessment history endpoint.</p>
          </div>
        </CardContent>
      </div>
    </div>
  );
};