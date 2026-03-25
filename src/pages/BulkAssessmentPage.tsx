import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { PageHeader } from "@/components/PageHeader";
import { LevelIndicator } from "@/components/LevelIndicator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { EmptyState } from "@/components/EmptyState";
import { Progress } from "@/components/ui/progress";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { MOCK_EMPLOYEES, type EmployeeListItem } from "@/services/employees";
import { MOCK_ROLES } from "@/services/roles";
import { MOCK_ASSESSMENTS } from "@/services/assessments";
import { Send, User, AlertTriangle } from "lucide-react";
import api from "@/services/api";

interface AssessmentRow {
  competency_id: string;
  competency_name: string;
  category: string;
  required_level: number;
  current_level: number | null;
  new_level: number;
  notes: string;
}

const LEVEL_LABELS: Record<number, string> = {
  0: "No Knowledge",
  1: "Awareness",
  2: "Basic",
  3: "Competent",
  4: "Proficient",
  5: "Expert",
};

export default function BulkAssessmentPage() {
  const navigate = useNavigate();
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
  const [rows, setRows] = useState<AssessmentRow[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitProgress, setSubmitProgress] = useState(0);

  const employees = MOCK_EMPLOYEES.filter((e) => e.is_active);

  const selectedEmployee = useMemo(
    () => employees.find((e) => e.id === selectedEmployeeId),
    [selectedEmployeeId, employees]
  );

  useEffect(() => {
    if (!selectedEmployee) {
      setRows([]);
      return;
    }
    const role = MOCK_ROLES.find((r) => r.id === selectedEmployee.role_id);
    if (!role) {
      setRows([]);
      return;
    }

    const newRows: AssessmentRow[] = role.competency_requirements.map((req) => {
      const latest = MOCK_ASSESSMENTS
        .filter((a) => a.employee_id === selectedEmployee.id && a.competency_id === req.competency_id)
        .sort((a, b) => new Date(b.assessed_at).getTime() - new Date(a.assessed_at).getTime())[0];

      return {
        competency_id: req.competency_id,
        competency_name: req.competency_name,
        category: getCategoryFromId(req.competency_id),
        required_level: req.required_level,
        current_level: latest ? latest.assessed_level : null,
        new_level: latest ? latest.assessed_level : 0,
        notes: "",
      };
    });
    setRows(newRows);
  }, [selectedEmployeeId]);

  function getCategoryFromId(id: string): string {
    const cats: Record<string, string> = {
      "comp-1": "technical", "comp-2": "technical", "comp-3": "technical",
      "comp-4": "safety", "comp-5": "technical", "comp-6": "technical",
      "comp-7": "technical", "comp-8": "technical", "comp-9": "process",
      "comp-10": "technical", "comp-11": "safety", "comp-12": "technical",
    };
    return cats[id] || "technical";
  }

  function updateRow(index: number, updates: Partial<AssessmentRow>) {
    setRows((prev) => prev.map((r, i) => (i === index ? { ...r, ...updates } : r)));
  }

  async function handleSubmit() {
    if (!selectedEmployeeId || rows.length === 0) return;

    setSubmitting(true);
    setSubmitProgress(0);

    try {
      await api.post("/assessments/bulk", {
        employee_id: selectedEmployeeId,
        assessments: rows.map((r) => ({
          competency_id: r.competency_id,
          assessed_level: r.new_level,
          notes: r.notes || undefined,
        })),
      });

      setSubmitProgress(100);
      toast({ title: "Assessments submitted", description: `${rows.length} assessments recorded successfully.` });
      setTimeout(() => navigate(`/employees/${selectedEmployeeId}`), 500);
    } catch {
      // Simulate success with mock
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.floor(100 / rows.length);
        if (progress >= 100) {
          progress = 100;
          clearInterval(interval);
          toast({ title: "Assessments submitted", description: `${rows.length} assessments recorded successfully.` });
          setTimeout(() => navigate(`/employees/${selectedEmployeeId}`), 500);
        }
        setSubmitProgress(progress);
      }, 150);
    }
  }

  const hasGaps = rows.some((r) => r.new_level < r.required_level);

  return (
    <AppLayout>
      <PageHeader
        title="Bulk Assessment"
        subtitle="Assess all competencies for an employee at once"
        breadcrumbs={[
          { label: "Assessments", href: "/assessments" },
          { label: "Bulk Assessment" },
        ]}
      />

      {/* Step 1: Select Employee */}
      <div className="glass rounded-card p-5 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">1</div>
          <h2 className="text-sm font-semibold text-foreground">Select Employee</h2>
        </div>
        <Select value={selectedEmployeeId} onValueChange={setSelectedEmployeeId}>
          <SelectTrigger className="max-w-md">
            <SelectValue placeholder="Choose an employee..." />
          </SelectTrigger>
          <SelectContent>
            {employees.map((emp) => (
              <SelectItem key={emp.id} value={emp.id}>
                {emp.full_name} — {emp.role_name} ({emp.department})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Step 2: Assessment Grid */}
      {selectedEmployee && rows.length > 0 && (
        <div className="glass rounded-card p-5 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">2</div>
            <h2 className="text-sm font-semibold text-foreground">Assessment Grid</h2>
            <span className="text-xs text-muted-foreground ml-2">
              {selectedEmployee.full_name} • {selectedEmployee.role_name}
            </span>
          </div>

          <div className="overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Competency</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-center">Required</TableHead>
                  <TableHead className="text-center">Current</TableHead>
                  <TableHead className="w-[200px]">New Level</TableHead>
                  <TableHead className="w-[200px]">Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row, i) => {
                  const hasGap = row.new_level < row.required_level;
                  const gap = row.required_level - row.new_level;
                  return (
                    <TableRow key={row.competency_id} className={cn(hasGap && "bg-destructive/5")}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {row.competency_name}
                          {hasGap && <AlertTriangle className="h-3.5 w-3.5 text-warning" />}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground capitalize">{row.category}</span>
                      </TableCell>
                      <TableCell className="text-center">
                        <LevelIndicator level={row.required_level} size="sm" />
                      </TableCell>
                      <TableCell className="text-center">
                        {row.current_level !== null ? (
                          <LevelIndicator level={row.current_level} size="sm" />
                        ) : (
                          <span className="text-xs text-muted-foreground">Not assessed</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <Slider
                            value={[row.new_level]}
                            onValueChange={([v]) => updateRow(i, { new_level: v })}
                            min={0}
                            max={5}
                            step={1}
                            className="w-full"
                          />
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-muted-foreground">{LEVEL_LABELS[row.new_level]}</span>
                            <span className={cn(
                              "text-xs font-medium tabular-nums",
                              hasGap ? (gap >= 3 ? "text-destructive" : "text-warning") : "text-success"
                            )}>
                              {row.new_level}/5
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Textarea
                          value={row.notes}
                          onChange={(e) => updateRow(i, { notes: e.target.value })}
                          placeholder="Optional notes..."
                          className="min-h-[60px] text-xs resize-none"
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {selectedEmployee && rows.length === 0 && (
        <EmptyState
          icon={<User className="h-8 w-8" />}
          title="No competency requirements"
          description="This employee's role has no competency requirements defined."
        />
      )}

      {/* Step 3: Submit */}
      {selectedEmployee && rows.length > 0 && (
        <div className="glass rounded-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">3</div>
            <h2 className="text-sm font-semibold text-foreground">Submit</h2>
          </div>

          {hasGaps && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-warning/10 border border-warning/20 mb-4">
              <AlertTriangle className="h-4 w-4 text-warning shrink-0" />
              <p className="text-xs text-warning">
                Some competencies are below the required level. Assessments will still be recorded.
              </p>
            </div>
          )}

          {submitting && (
            <div className="mb-4 space-y-2">
              <Progress value={submitProgress} className="h-2" />
              <p className="text-xs text-muted-foreground text-center">{submitProgress}% complete</p>
            </div>
          )}

          <Button onClick={handleSubmit} disabled={submitting} className="w-full sm:w-auto">
            {submitting ? (
              <LoadingSpinner size="sm" className="mr-2" />
            ) : (
              <Send className="h-4 w-4 mr-2" />
            )}
            Submit All Assessments ({rows.length})
          </Button>
        </div>
      )}
    </AppLayout>
  );
}
