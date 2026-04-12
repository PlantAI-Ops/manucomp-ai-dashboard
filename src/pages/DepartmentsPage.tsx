import React, { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/EmptyState";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { DepartmentFormModal } from "@/components/departments/DepartmentFormModal";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Plus, Search, Users, Pencil, Trash2, LayoutGrid, LayoutList, ChevronLeft, ChevronRight, X, Building2,
} from "lucide-react";
import {
  useDepartments, useCreateDepartment, useUpdateDepartment, useDeleteDepartment,
  type Department, type DepartmentFormData,
} from "@/services/departments";
import { useEmployeesForSelect } from "@/services/employees";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const DepartmentPage: React.FC = () => {
  const { toast } = useToast();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Department | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Department | null>(null);
  const pageSize = 12;

  const { data: apiData, isLoading } = useDepartments();
  const { data: employees = [] } = useEmployeesForSelect();
  const createMut = useCreateDepartment();
  const updateMut = useUpdateDepartment();
  const deleteMut = useDeleteDepartment();

  const items = Array.isArray(apiData) ? apiData : (apiData?.items ?? []);
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));

  const filteredItems = items.filter((d) =>
    !debouncedSearch ||
    d.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
    d.description?.toLowerCase().includes(debouncedSearch.toLowerCase())
  );

  const paginatedItems = filteredItems.slice((page - 1) * pageSize, page * pageSize);
  const hasFilters = !!debouncedSearch;

  const clearFilters = () => {
    setSearch("");
    setDebouncedSearch("");
    setPage(1);
  };

  const handleSearchChange = (val: string) => {
    setSearch(val);
    const timer = setTimeout(() => {
      setDebouncedSearch(val);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  };

  const handleCreate = () => {
    setEditTarget(null);
    setFormOpen(true);
  };

  const handleEdit = (dept: Department) => {
    setEditTarget(dept);
    setFormOpen(true);
  };

  const handleFormSubmit = async (formData: DepartmentFormData) => {
    try {
      if (editTarget) {
        await updateMut.mutateAsync({ id: editTarget.id, body: formData });
        toast({ title: "Department updated" });
      } else {
        await createMut.mutateAsync(formData);
        toast({ title: "Department created" });
      }
      setFormOpen(false);
    } catch {
      toast({ title: "Error", description: "Failed to save department", variant: "destructive" });
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMut.mutateAsync(deleteTarget.id);
      toast({ title: "Department deleted" });
      setDeleteTarget(null);
    } catch {
      toast({ title: "Error", description: "Failed to delete department", variant: "destructive" });
    }
  };

  const getReadinessColor = (count: number) => {
    if (count >= 30) return "text-success";
    if (count >= 15) return "text-warning";
    return "text-destructive";
  };

  return (
    <AppLayout>
      <PageHeader
        title="Departments"
        subtitle="Organizational units and teams"
        actions={
          <Button onClick={handleCreate} className="gap-1.5">
            <Plus className="h-4 w-4" /> Add Department
          </Button>
        }
      />

      <div className="glass rounded-card p-4 mb-6">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search departments…"
              className="pl-9 bg-muted/50 border-border/50 rounded-input"
            />
          </div>

          <div className="flex items-center border border-border/50 rounded-md ml-auto">
            <Button
              variant={viewMode === "table" ? "secondary" : "ghost"}
              size="icon"
              className="h-8 w-8 rounded-r-none"
              onClick={() => setViewMode("table")}
            >
              <LayoutList className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "grid" ? "secondary" : "ghost"}
              size="icon"
              className="h-8 w-8 rounded-l-none"
              onClick={() => setViewMode("grid")}
            >
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

      {isLoading ? (
        <div className="glass rounded-card p-4 space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full bg-muted" />
          ))}
        </div>
      ) : paginatedItems.length === 0 ? (
        <EmptyState
          icon={<Building2 className="h-6 w-6" />}
          title={hasFilters ? "No departments found" : "No departments in the system"}
          description={hasFilters ? "Try adjusting your search" : "Create your first department to organize your workforce."}
          actionLabel={!hasFilters ? "Add Department" : undefined}
          onAction={!hasFilters ? handleCreate : undefined}
        />
      ) : viewMode === "table" ? (
        <div className="glass rounded-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50">
                  {["Department", "Description", "Manager", "Employees", "Created", "Actions"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginatedItems.map((dept) => (
                  <tr key={dept.id} className="border-b border-border/30 last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                          <Building2 className="h-4 w-4" />
                        </div>
                        <span className="font-medium text-foreground">{dept.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground max-w-[240px] truncate">
                      {dept.description || "—"}
                    </td>
                    <td className="px-4 py-3">
                      {dept.manager_name ? (
                        <Badge variant="outline" className="bg-primary/5">{dept.manager_name}</Badge>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <Users className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className={cn("font-medium", getReadinessColor(dept.employee_count))}>
                          {dept.employee_count}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {format(new Date(dept.created_at), "MMM d, yyyy")}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleEdit(dept)}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-destructive hover:text-destructive"
                          onClick={() => setDeleteTarget(dept)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-border/50 px-4 py-3">
              <span className="text-xs text-muted-foreground">{filteredItems.length} departments</span>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8" disabled={page <= 1} onClick={() => setPage(page - 1)}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="px-2 text-xs tabular-nums text-muted-foreground">{page} / {totalPages}</span>
                <Button variant="ghost" size="icon" className="h-8 w-8" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {paginatedItems.map((dept) => (
            <Card key={dept.id} className="glass border-border/50 hover:border-border transition-colors group">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Building2 className="h-4 w-4" />
                    </div>
                    <h3 className="font-medium text-foreground leading-snug">{dept.name}</h3>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleEdit(dept)}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive hover:text-destructive"
                      onClick={() => setDeleteTarget(dept)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
                {dept.description && (
                  <p className="text-xs text-muted-foreground line-clamp-2">{dept.description}</p>
                )}
                <div className="flex items-center justify-between pt-1">
                  {dept.manager_name ? (
                    <Badge variant="outline" className="text-xs bg-primary/5">{dept.manager_name}</Badge>
                  ) : (
                    <span className="text-xs text-muted-foreground">No manager</span>
                  )}
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Users className="h-3 w-3" />
                    {dept.employee_count}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <DepartmentFormModal
        open={formOpen}
        onOpenChange={setFormOpen}
        department={editTarget}
        employees={employees}
        onSubmit={handleFormSubmit}
        loading={createMut.isPending || updateMut.isPending}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete Department"
        description={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        confirmVariant="destructive"
        onConfirm={handleDelete}
        loading={deleteMut.isPending}
      />
    </AppLayout>
  );
};

export default DepartmentPage;
