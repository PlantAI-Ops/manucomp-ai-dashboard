import { useState, useEffect, useMemo } from "react";
import { Modal } from "@/components/Modal";
import { FormField } from "@/components/FormField";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Skeleton } from "@/components/ui/skeleton";
import { LevelIndicator } from "@/components/LevelIndicator";
import { StatusBadge } from "@/components/StatusBadge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, X, Sparkles, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  useCompetencyOptions,
  useCreateRole,
  useUpdateRole,
  useSuggestCompetencies,
  MOCK_COMPETENCIES,
  DEPARTMENTS,
  type RoleListItem,
  type CompetencySuggestion,
} from "@/services/roles";

interface CompetencyRow {
  id: string; // local key
  competency_id: string;
  required_level: number;
  is_mandatory: boolean;
}

interface RoleFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  role: RoleListItem | null;
}

export const RoleFormModal = ({ open, onOpenChange, role }: RoleFormModalProps) => {
  const isEdit = !!role;

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [department, setDepartment] = useState("");
  const [competencyRows, setCompetencyRows] = useState<CompetencyRow[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [suggestions, setSuggestions] = useState<CompetencySuggestion[]>([]);

  const { data: apiCompetencies, isError: compError } = useCompetencyOptions();
  const competencies = compError || !apiCompetencies ? MOCK_COMPETENCIES : apiCompetencies;

  const createMutation = useCreateRole();
  const updateMutation = useUpdateRole();
  const suggestMutation = useSuggestCompetencies();

  const saving = createMutation.isPending || updateMutation.isPending;

  useEffect(() => {
    if (!open) return;
    if (role) {
      setName(role.name);
      setDescription(role.description);
      setDepartment(role.department ?? "");
      setCompetencyRows(
        role.competency_requirements.map((cr, i) => ({
          id: `existing-${i}`,
          competency_id: cr.competency_id,
          required_level: cr.required_level,
          is_mandatory: cr.is_mandatory,
        }))
      );
    } else {
      setName("");
      setDescription("");
      setDepartment("");
      setCompetencyRows([]);
    }
    setErrors({});
    setSuggestions([]);
  }, [open, role]);

  const usedCompIds = useMemo(
    () => new Set(competencyRows.map((r) => r.competency_id)),
    [competencyRows]
  );

  const validate = () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = "Name is required";
    if (!description.trim()) e.description = "Description is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    const body = {
      name: name.trim(),
      description: description.trim(),
      department: department.trim() || undefined,
      competency_requirements: competencyRows
        .filter((r) => r.competency_id)
        .map((r) => ({
          competency_id: r.competency_id,
          required_level: r.required_level,
          is_mandatory: r.is_mandatory,
        })),
    };
    try {
      if (isEdit) {
        await updateMutation.mutateAsync({ id: role.id, data: body });
        toast.success("Role updated");
      } else {
        await createMutation.mutateAsync(body);
        toast.success("Role created");
      }
      onOpenChange(false);
    } catch {
      toast.error(isEdit ? "Failed to update role" : "Failed to create role");
    }
  };

  const addRow = () => {
    setCompetencyRows((prev) => [
      ...prev,
      { id: `new-${Date.now()}`, competency_id: "", required_level: 3, is_mandatory: true },
    ]);
  };

  const removeRow = (id: string) => {
    setCompetencyRows((prev) => prev.filter((r) => r.id !== id));
  };

  const updateRow = (id: string, patch: Partial<CompetencyRow>) => {
    setCompetencyRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  };

  const handleSuggest = async () => {
    if (!name.trim()) {
      toast.error("Enter a role name first");
      return;
    }
    try {
      const result = await suggestMutation.mutateAsync({
        role_name: name,
        role_description: description,
        department,
      });
      setSuggestions(result);
    } catch {
      // Show fallback mock suggestions
      setSuggestions([
        { name: "Safety Protocols", description: "Knowledge of workplace safety standards", category: "Safety", confidence: 0.95, reasoning: "Essential for all manufacturing roles" },
        { name: "Blueprint Reading", description: "Ability to interpret technical drawings", category: "Technical", confidence: 0.88, reasoning: "Required for understanding work instructions" },
        { name: "Quality Inspection", description: "Skills in inspecting parts and assemblies", category: "Quality", confidence: 0.82, reasoning: "Quality awareness is important for this role" },
      ]);
      toast.info("Showing sample suggestions (AI endpoint unavailable)");
    }
  };

  const addSuggestion = (s: CompetencySuggestion) => {
    // Find matching competency or use first available
    const match = competencies.find((c) => c.name.toLowerCase() === s.name.toLowerCase());
    if (match && usedCompIds.has(match.id)) {
      toast.info(`${s.name} already added`);
      return;
    }
    setCompetencyRows((prev) => [
      ...prev,
      {
        id: `sug-${Date.now()}-${Math.random()}`,
        competency_id: match?.id ?? "",
        required_level: 3,
        is_mandatory: true,
      },
    ]);
    setSuggestions((prev) => prev.filter((x) => x.name !== s.name));
  };

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={isEdit ? "Edit Role" : "Create Role"}
      description={isEdit ? "Update role details and competency requirements" : "Define a new role with competency requirements"}
      size="xl"
      className="max-h-[85vh] overflow-y-auto"
    >
      <div className="space-y-5">
        {/* Basic fields */}
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Name" error={errors.name} required>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. CNC Operator" className="bg-muted/50 border-border/50 rounded-input" />
          </FormField>
          <FormField label="Department">
            <Select value={department || "__none__"} onValueChange={(v) => setDepartment(v === "__none__" ? "" : v)}>
              <SelectTrigger className="bg-muted/50 border-border/50 rounded-input">
                <SelectValue placeholder="Select department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">None</SelectItem>
                {DEPARTMENTS.map((d) => (
                  <SelectItem key={d} value={d}>{d}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>
        </div>
        <FormField label="Description" error={errors.description} required>
          <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe the role responsibilities…" rows={3} className="bg-muted/50 border-border/50 rounded-input" />
        </FormField>

        {/* Competency Requirements */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-foreground">Competency Requirements</h4>
            <Button variant="outline" size="sm" onClick={addRow} className="text-xs">
              <Plus className="mr-1 h-3 w-3" /> Add Requirement
            </Button>
          </div>

          {competencyRows.length === 0 && (
            <p className="text-xs text-muted-foreground py-4 text-center border border-dashed border-border/50 rounded-card">
              No competency requirements added yet
            </p>
          )}

          <div className="space-y-2">
            {competencyRows.map((row) => (
              <div
                key={row.id}
                className="flex flex-wrap items-center gap-3 rounded-card border border-border/40 bg-muted/20 p-3"
              >
                <div className="flex-1 min-w-[180px]">
                  <Select
                    value={row.competency_id || "__none__"}
                    onValueChange={(v) => updateRow(row.id, { competency_id: v === "__none__" ? "" : v })}
                  >
                    <SelectTrigger className="h-8 text-xs bg-muted/50 border-border/50 rounded-input">
                      <SelectValue placeholder="Select competency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__" disabled>Select competency</SelectItem>
                      {competencies
                        .filter((c) => c.id === row.competency_id || !usedCompIds.has(c.id))
                        .map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.name}
                            <span className="ml-1 text-muted-foreground">({c.category})</span>
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-2 min-w-[180px]">
                  <span className="text-xs text-muted-foreground whitespace-nowrap">Level:</span>
                  <Slider
                    value={[row.required_level]}
                    onValueChange={([v]) => updateRow(row.id, { required_level: v })}
                    min={1}
                    max={5}
                    step={1}
                    className="w-24"
                  />
                  <LevelIndicator level={row.required_level} size="sm" />
                </div>
                <label className="flex items-center gap-1.5 text-xs cursor-pointer">
                  <Checkbox
                    checked={row.is_mandatory}
                    onCheckedChange={(v) => updateRow(row.id, { is_mandatory: !!v })}
                  />
                  Mandatory
                </label>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => removeRow(row.id)}>
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
          </div>

          {/* AI Suggestions */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleSuggest}
            disabled={suggestMutation.isPending}
            className="text-xs border-primary/30 text-primary hover:bg-primary/10"
          >
            <Sparkles className="mr-1 h-3.5 w-3.5" />
            {suggestMutation.isPending ? "Generating…" : "Suggest Competencies with AI"}
          </Button>

          {suggestMutation.isPending && (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full bg-muted" />
              ))}
            </div>
          )}

          {suggestions.length > 0 && (
            <div className="rounded-card border border-primary/20 bg-primary/5 p-3 space-y-2">
              <h5 className="text-xs font-medium text-primary flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5" /> AI Suggestions
              </h5>
              {suggestions.map((s) => (
                <div key={s.name} className="flex items-start gap-3 rounded-input bg-muted/30 p-2.5">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{s.name}</span>
                      <StatusBadge variant="info">{s.category}</StatusBadge>
                      <span className="text-[10px] text-muted-foreground">
                        {Math.round(s.confidence * 100)}% confidence
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{s.reasoning}</p>
                  </div>
                  <Button size="sm" variant="outline" className="text-xs shrink-0" onClick={() => addSuggestion(s)}>
                    <Plus className="mr-1 h-3 w-3" /> Add
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 pt-2 border-t border-border/50">
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving…" : isEdit ? "Update Role" : "Create Role"}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
