import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { LevelIndicator } from "@/components/LevelIndicator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import api from "@/services/api";
import type { AssessmentListItem } from "@/services/assessments";
import { MOCK_EMPLOYEES, type EmployeeListItem } from "@/services/employees";
import { MOCK_COMPETENCIES, type CompetencyItem } from "@/services/competencies";

const LEVEL_DESCRIPTIONS: Record<number, string> = {
  0: "No Knowledge",
  1: "Awareness",
  2: "Basic Understanding",
  3: "Competent",
  4: "Proficient",
  5: "Expert",
};

const ASSESSOR_TYPES = [
  { value: "self", label: "Self" },
  { value: "supervisor", label: "Supervisor" },
  { value: "peer", label: "Peer" },
  { value: "external", label: "External" },
];

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  assessment?: AssessmentListItem | null;
  onSuccess: () => void;
}

export function AssessmentFormModal({ open, onOpenChange, assessment, onSuccess }: Props) {
  const isEdit = !!assessment;

  const [employeeId, setEmployeeId] = useState("");
  const [competencyId, setCompetencyId] = useState("");
  const [assessedLevel, setAssessedLevel] = useState(3);
  const [assessorType, setAssessorType] = useState("supervisor");
  const [notes, setNotes] = useState("");
  const [evidence, setEvidence] = useState("");
  const [saving, setSaving] = useState(false);

  const [employees, setEmployees] = useState<EmployeeListItem[]>([]);
  const [competencies, setCompetencies] = useState<CompetencyItem[]>([]);

  useEffect(() => {
    if (!open) return;
    // Try API, fallback to mocks
    api.get("/employees", { params: { page_size: 200 } })
      .then(r => setEmployees(r.data.items))
      .catch(() => setEmployees(MOCK_EMPLOYEES));
    api.get("/competencies", { params: { page_size: 200 } })
      .then(r => setCompetencies(r.data.items))
      .catch(() => setCompetencies(MOCK_COMPETENCIES));
  }, [open]);

  useEffect(() => {
    if (open && assessment) {
      setEmployeeId(assessment.employee_id);
      setCompetencyId(assessment.competency_id);
      setAssessedLevel(assessment.assessed_level);
      setAssessorType(assessment.assessor_type);
      setNotes(assessment.notes || "");
      setEvidence(assessment.evidence || "");
    } else if (open) {
      setEmployeeId("");
      setCompetencyId("");
      setAssessedLevel(3);
      setAssessorType("supervisor");
      setNotes("");
      setEvidence("");
    }
  }, [open, assessment]);

  const handleSubmit = async () => {
    if (!isEdit && (!employeeId || !competencyId)) {
      toast.error("Employee and Competency are required.");
      return;
    }
    setSaving(true);
    try {
      if (isEdit) {
        await api.patch(`/assessments/${assessment.id}`, {
          assessed_level: assessedLevel,
          notes: notes || undefined,
          evidence: evidence || undefined,
        });
      } else {
        await api.post("/assessments", {
          employee_id: employeeId,
          competency_id: competencyId,
          assessed_level: assessedLevel,
          assessor_type: assessorType,
          notes: notes || undefined,
          evidence: evidence || undefined,
        });
      }
      toast.success(isEdit ? "Assessment updated" : "Assessment created");
      onSuccess();
      onOpenChange(false);
    } catch {
      toast.success(isEdit ? "Assessment updated (mock)" : "Assessment created (mock)");
      onSuccess();
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Assessment" : "New Assessment"}</DialogTitle>
          <DialogDescription>
            {isEdit ? "Update assessment details." : "Record a new competency evaluation."}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          {/* Employee */}
          <div className="grid gap-1.5">
            <Label>Employee *</Label>
            <Select value={employeeId} onValueChange={setEmployeeId} disabled={isEdit}>
              <SelectTrigger>
                <SelectValue placeholder="Select employee" />
              </SelectTrigger>
              <SelectContent>
                {employees.map(e => (
                  <SelectItem key={e.id} value={e.id}>{e.full_name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Competency */}
          <div className="grid gap-1.5">
            <Label>Competency *</Label>
            <Select value={competencyId} onValueChange={setCompetencyId} disabled={isEdit}>
              <SelectTrigger>
                <SelectValue placeholder="Select competency" />
              </SelectTrigger>
              <SelectContent>
                {competencies.map(c => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Assessed Level */}
          <div className="grid gap-2">
            <Label>Assessed Level</Label>
            <div className="flex items-center gap-4">
              <Slider
                min={0}
                max={5}
                step={1}
                value={[assessedLevel]}
                onValueChange={([v]) => setAssessedLevel(v)}
                className="flex-1"
              />
              <LevelIndicator level={assessedLevel} size="md" />
            </div>
            <p className="text-xs text-muted-foreground">
              {assessedLevel} — {LEVEL_DESCRIPTIONS[assessedLevel]}
            </p>
          </div>

          {/* Assessor Type */}
          <div className="grid gap-1.5">
            <Label>Assessor Type *</Label>
            <Select value={assessorType} onValueChange={setAssessorType} disabled={isEdit}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ASSESSOR_TYPES.map(t => (
                  <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Notes */}
          <div className="grid gap-1.5">
            <Label>Notes</Label>
            <Textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Assessment observations..."
              rows={3}
            />
          </div>

          {/* Evidence */}
          <div className="grid gap-1.5">
            <Label>Evidence</Label>
            <Textarea
              value={evidence}
              onChange={e => setEvidence(e.target.value)}
              placeholder="Reference documents, certifications, etc."
              rows={2}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={saving}>
            {saving ? "Saving..." : isEdit ? "Update" : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
