import React, { useEffect, useState } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { AlertTriangle } from "lucide-react";
import type { CompetencyItem, CompetencyFormData } from "@/services/competencies";

const CATEGORIES = [
  { value: "technical", label: "Technical" },
  { value: "soft_skills", label: "Soft Skills" },
  { value: "safety", label: "Safety" },
  { value: "regulatory", label: "Regulatory" },
  { value: "process", label: "Process" },
] as const;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  competency?: CompetencyItem | null;
  onSubmit: (data: CompetencyFormData) => void;
  loading?: boolean;
}

export const CompetencyFormModal: React.FC<Props> = ({
  open, onOpenChange, competency, onSubmit, loading,
}) => {
  const isEdit = !!competency;
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("technical");
  const [safetyCritical, setSafetyCritical] = useState(false);
  const [detailedDescription, setDetailedDescription] = useState("");
  const [bestPractices, setBestPractices] = useState("");
  const [commonMistakes, setCommonMistakes] = useState("");

  useEffect(() => {
    if (open) {
      if (competency) {
        setName(competency.name);
        setDescription(competency.description);
        setCategory(competency.category);
        setSafetyCritical(competency.is_safety_critical);
        setDetailedDescription(competency.detailed_description || "");
        setBestPractices(competency.best_practices || "");
        setCommonMistakes(competency.common_mistakes || "");
      } else {
        setName(""); setDescription(""); setCategory("technical");
        setSafetyCritical(false); setDetailedDescription("");
        setBestPractices(""); setCommonMistakes("");
      }
    }
  }, [open, competency]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      name, description, category,
      is_safety_critical: safetyCritical,
      detailed_description: detailedDescription || null,
      best_practices: bestPractices || null,
      common_mistakes: commonMistakes || null,
    });
  };

  const valid = name.trim() && description.trim() && category;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass sm:max-w-xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Competency" : "Add Competency"}</DialogTitle>
          <DialogDescription>
            {isEdit ? "Update competency details" : "Define a new skill or knowledge area"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="comp-name">Name *</Label>
            <Input id="comp-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. CNC Machine Operation" required />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="comp-desc">Description *</Label>
            <Textarea id="comp-desc" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Brief description of this competency" className="min-h-[70px]" required />
          </div>

          <div className="space-y-1.5">
            <Label>Category *</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between rounded-lg border border-border/50 p-3">
            <div className="space-y-0.5">
              <Label htmlFor="comp-safety" className="cursor-pointer">Safety Critical</Label>
              <p className="text-xs text-muted-foreground">Mark if failure poses a safety risk</p>
            </div>
            <Switch id="comp-safety" checked={safetyCritical} onCheckedChange={setSafetyCritical} />
          </div>
          {safetyCritical && (
            <div className="flex items-center gap-2 rounded-md bg-destructive/10 px-3 py-2 text-xs text-destructive">
              <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
              Safety-critical competencies require additional oversight and assessment frequency.
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="comp-detailed">Detailed Description</Label>
            <Textarea id="comp-detailed" value={detailedDescription} onChange={(e) => setDetailedDescription(e.target.value)} placeholder="In-depth description (optional)" className="min-h-[60px]" />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="comp-bp">Best Practices</Label>
            <Textarea id="comp-bp" value={bestPractices} onChange={(e) => setBestPractices(e.target.value)} placeholder="Recommended best practices (optional)" className="min-h-[60px]" />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="comp-cm">Common Mistakes</Label>
            <Textarea id="comp-cm" value={commonMistakes} onChange={(e) => setCommonMistakes(e.target.value)} placeholder="Frequent errors to avoid (optional)" className="min-h-[60px]" />
          </div>

          <DialogFooter className="gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} disabled={loading}>Cancel</Button>
            <Button type="submit" disabled={!valid || loading}>{loading ? "Saving…" : isEdit ? "Update" : "Create"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
