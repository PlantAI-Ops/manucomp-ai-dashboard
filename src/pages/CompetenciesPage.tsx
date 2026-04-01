import React, { useState, useMemo } from "react";
import { AppLayout } from "@/components/AppLayout";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/EmptyState";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { CompetencyFormModal } from "@/components/competencies/CompetencyFormModal";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Plus, Search, AlertTriangle, Eye, Pencil, Trash2,
  LayoutGrid, LayoutList, ChevronLeft, ChevronRight, X,
} from "lucide-react";
import {
  useCompetenciesPaginated, useCreateCompetency, useUpdateCompetency, useDeleteCompetency,
  type CompetencyItem, type CompetencyFormData,
} from "@/services/competencies";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const CATEGORY_CONFIG: Record<string, { label: string; className: string }> = {
  technical: { label: "Technical", className: "bg-info/15 text-info border-info/30" },
  soft_skills: { label: "Soft Skills", className: "bg-purple-500/15 text-purple-400 border-purple-500/30" },
  safety: { label: "Safety", className: "bg-destructive/15 text-destructive border-destructive/30" },
  regulatory: { label: "Regulatory", className: "bg-warning/15 text-warning border-warning/30" },
  process: { label: "Process", className: "bg-secondary/15 text-secondary border-secondary/30" },
};

const CategoryBadge: React.FC<{ category: string }> = ({ category }) => {
  const cfg = CATEGORY_CONFIG[category] || { label: category, className: "" };
  return <Badge variant="outline" className={cn("text-xs", cfg.className)}>{cfg.label}</Badge>;
};

const CompetenciesPage: React.FC = () => {
  const { toast } = useToast();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [category, setCategory] = useState<string>("");
  const [safetyCriticalOnly, setSafetyCriticalOnly] = useState(false);
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<CompetencyItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CompetencyItem | null>(null);
  const pageSize = 12;

  // Debounce search
  const searchTimerRef = React.useRef<ReturnType<typeof setTimeout>>();
  const handleSearchChange = (val: string) => {
    setSearch(val);
    clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(() => { setDebouncedSearch(val); setPage(1); }, 300);
  };

  const { data, isLoading } = useCompetenciesPaginated(page, pageSize, debouncedSearch, category || undefined, safetyCriticalOnly);
  const createMut = useCreateCompetency();
  const updateMut = useUpdateCompetency();
  const deleteMut = useDeleteCompetency();

  const items = data?.items ?? [];
  const totalPages = data?.total_pages ?? 1;

  const displayedItems = useMemo(() => {
    if (!safetyCriticalOnly) return items;
    return items.filter((c) => c.is_safety_critical);
  }, [items, safetyCriticalOnly]);

  const hasFilters = !!debouncedSearch || !!category || safetyCriticalOnly;

  const clearFilters = () => {
    setSearch(""); setDebouncedSearch(""); setCategory(""); setSafetyCriticalOnly(false); setPage(1);
  };

  const handleCreate = () => { setEditTarget(null); setFormOpen(true); };
  const handleEdit = (c: CompetencyItem) => { setEditTarget(c); setFormOpen(true); };

  const handleFormSubmit = async (formData: CompetencyFormData) => {
    try {
      if (editTarget) {
        await updateMut.mutateAsync({ id: editTarget.id, body: formData });
        toast({ title: "Competency updated" });
      } else {
        await createMut.mutateAsync(formData);
        toast({ title: "Competency created" });
      }
      setFormOpen(false);
    } catch {
      toast({ title: "Error", description: "Failed to save competency", variant: "destructive" });
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMut.mutateAsync(deleteTarget.id);
      toast({ title: "Competency deleted" });
      setDeleteTarget(null);
    } catch {
      toast({ title: "Error", description: "Failed to delete competency", variant: "destructive" });
    }
  };

  return (
    <AppLayout>
      <PageHeader
        title="Competencies"
        subtitle="Skills and knowledge areas"
        actions={
          <Button onClick={handleCreate} className="gap-1.5">
            <Plus className="h-4 w-4" /> Add Competency
          </Button>
        }
      />

      {/* Filters bar */}
      <div className="glass rounded-card p-4 mb-6">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={search} onChange={(e) => handleSearchChange(e.target.value)} placeholder="Search competencies…" className="pl-9 bg-muted/50 border-border/50 rounded-input" />
          </div>

          <Select value={category} onValueChange={(v) => { setCategory(v); setPage(1); }}>
            <SelectTrigger className="w-[160px] bg-muted/50 border-border/50 rounded-input">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="technical">Technical</SelectItem>
              <SelectItem value="soft_skills">Soft Skills</SelectItem>
              <SelectItem value="safety">Safety</SelectItem>
              <SelectItem value="regulatory">Regulatory</SelectItem>
              <SelectItem value="process">Process</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant={safetyCriticalOnly ? "default" : "outline"}
            size="sm"
            onClick={() => { setSafetyCriticalOnly(!safetyCriticalOnly); setPage(1); }}
            className="gap-1.5"
          >
            <AlertTriangle className="h-3.5 w-3.5" />
            Safety Critical
          </Button>

          {/* View mode toggle */}
          <div className="flex items-center border border-border/50 rounded-md ml-auto">
            <Button variant={viewMode === "table" ? "secondary" : "ghost"} size="icon" className="h-8 w-8 rounded-r-none" onClick={() => setViewMode("table")}>
              <LayoutList className="h-4 w-4" />
            </Button>
            <Button variant={viewMode === "grid" ? "secondary" : "ghost"} size="icon" className="h-8 w-8 rounded-l-none" onClick={() => setViewMode("grid")}>
              <LayoutGrid className="h-4 w-4" />
            </Button>
          </div>

          {hasFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1 text-muted-foreground">
              <X className="h-3.5 w-3.5" /> Clear
            </Button>
          )}
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="glass rounded-card p-4 space-y-3">
          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full bg-muted" />)}
        </div>
      ) : displayedItems.length === 0 ? (
        <EmptyState
          icon={<Plus className="h-6 w-6" />}
          title={hasFilters ? "No competencies found" : "No competencies in the system"}
          description={hasFilters ? "Try adjusting your filters" : "Define your first competency to start tracking skills."}
          actionLabel={!hasFilters ? "Add Competency" : undefined}
          onAction={!hasFilters ? handleCreate : undefined}
        />
      ) : viewMode === "table" ? (
        <div className="glass rounded-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50">
                  {["Name", "Description", "Category", "Safety Critical", "Created", "Actions"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {displayedItems.map((c) => (
                  <tr key={c.id} className="border-b border-border/30 last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 font-medium text-foreground">{c.name}</td>
                    <td className="px-4 py-3 text-muted-foreground max-w-[240px] truncate">{c.description}</td>
                    <td className="px-4 py-3"><CategoryBadge category={c.category} /></td>
                    <td className="px-4 py-3">
                      {c.is_safety_critical ? <AlertTriangle className="h-4 w-4 text-warning" /> : <span className="text-muted-foreground">—</span>}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{format(new Date(c.created_at), "MMM d, yyyy")}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="h-7 w-7"><Eye className="h-3.5 w-3.5" /></Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleEdit(c)}><Pencil className="h-3.5 w-3.5" /></Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => setDeleteTarget(c)}><Trash2 className="h-3.5 w-3.5" /></Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-border/50 px-4 py-3">
              <span className="text-xs text-muted-foreground">{data?.total ?? 0} competencies</span>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8" disabled={page <= 1} onClick={() => setPage(page - 1)}><ChevronLeft className="h-4 w-4" /></Button>
                <span className="px-2 text-xs tabular-nums text-muted-foreground">{page} / {totalPages}</span>
                <Button variant="ghost" size="icon" className="h-8 w-8" disabled={page >= totalPages} onClick={() => setPage(page + 1)}><ChevronRight className="h-4 w-4" /></Button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {displayedItems.map((c) => (
              <Card key={c.id} className="glass border-border/50 hover:border-border transition-colors group">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-medium text-foreground leading-snug">{c.name}</h3>
                    {c.is_safety_critical && <AlertTriangle className="h-4 w-4 text-warning shrink-0 mt-0.5" />}
                  </div>
                  <CategoryBadge category={c.category} />
                  <p className="text-xs text-muted-foreground line-clamp-2">{c.description}</p>
                  <div className="flex items-center gap-1 pt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" className="h-7 w-7"><Eye className="h-3.5 w-3.5" /></Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleEdit(c)}><Pencil className="h-3.5 w-3.5" /></Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => setDeleteTarget(c)}><Trash2 className="h-3.5 w-3.5" /></Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <Button variant="ghost" size="icon" className="h-8 w-8" disabled={page <= 1} onClick={() => setPage(page - 1)}><ChevronLeft className="h-4 w-4" /></Button>
              <span className="text-xs tabular-nums text-muted-foreground">{page} / {totalPages}</span>
              <Button variant="ghost" size="icon" className="h-8 w-8" disabled={page >= totalPages} onClick={() => setPage(page + 1)}><ChevronRight className="h-4 w-4" /></Button>
            </div>
          )}
        </>
      )}

      <CompetencyFormModal open={formOpen} onOpenChange={setFormOpen} competency={editTarget} onSubmit={handleFormSubmit} loading={createMut.isPending || updateMut.isPending} />
      <ConfirmDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)} title="Delete Competency" description={`Permanently delete "${deleteTarget?.name}"? This cannot be undone.`} confirmLabel="Delete" variant="destructive" onConfirm={handleDelete} loading={deleteMut.isPending} />
    </AppLayout>
  );
};

export default CompetenciesPage;
