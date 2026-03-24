import { useState, useMemo } from "react";
import { AppLayout } from "@/components/AppLayout";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/StatusBadge";
import { LevelIndicator } from "@/components/LevelIndicator";
import { Skeleton } from "@/components/ui/skeleton";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { AssessmentFormModal } from "@/components/assessments/AssessmentFormModal";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Plus,
  Search,
  ClipboardList,
  ChevronLeft,
  ChevronRight,
  Eye,
  Pencil,
  Trash2,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import api from "@/services/api";
import {
  useAssessments,
  MOCK_ASSESSMENTS,
  type AssessmentListItem,
  type AssessmentFilters,
} from "@/services/assessments";
import { MOCK_EMPLOYEES } from "@/services/employees";
import { MOCK_COMPETENCIES } from "@/services/competencies";

const ASSESSOR_TYPE_COLORS: Record<string, "blue" | "green" | "purple" | "default"> = {
  self: "blue",
  supervisor: "green",
  peer: "purple",
  external: "default",
};

const CATEGORY_COLORS: Record<string, string> = {
  technical: "bg-info/10 text-info border-info/20",
  soft_skills: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  safety: "bg-destructive/10 text-destructive border-destructive/20",
  regulatory: "bg-warning/10 text-warning border-warning/20",
  process: "bg-secondary/10 text-secondary border-secondary/20",
};

export default function AssessmentsPage() {
  const [filters, setFilters] = useState<AssessmentFilters>({ page: 1, page_size: 20 });
  const [search, setSearch] = useState("");
  const [employeeFilter, setEmployeeFilter] = useState("__all__");
  const [competencyFilter, setCompetencyFilter] = useState("__all__");
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<AssessmentListItem | null>(null);
  const [deleteItem, setDeleteItem] = useState<AssessmentListItem | null>(null);

  const queryClient = useQueryClient();
  const { data, isLoading, isError } = useAssessments(filters);

  const effectiveFilters: AssessmentFilters = {
    ...filters,
    employee_id: employeeFilter !== "__all__" ? employeeFilter : undefined,
    competency_id: competencyFilter !== "__all__" ? competencyFilter : undefined,
  };

  const { data: apiData, isError: apiError } = useAssessments(effectiveFilters);

  // Fallback to mock
  const useMock = apiError || (!apiData && !isLoading);
  const allItems = useMock ? MOCK_ASSESSMENTS : (apiData?.items ?? []);
  const totalItems = useMock ? MOCK_ASSESSMENTS.length : (apiData?.total ?? 0);

  // Client-side filtering for mock
  const filtered = useMemo(() => {
    let items = allItems;
    if (employeeFilter !== "__all__") {
      items = items.filter(a => a.employee_id === employeeFilter);
    }
    if (competencyFilter !== "__all__") {
      items = items.filter(a => a.competency_id === competencyFilter);
    }
    if (search.trim()) {
      const s = search.toLowerCase();
      items = items.filter(a =>
        a.employee_name.toLowerCase().includes(s) ||
        a.competency_name.toLowerCase().includes(s)
      );
    }
    return items;
  }, [allItems, search, employeeFilter, competencyFilter]);

  const pageSize = filters.page_size;
  const totalPages = Math.max(1, Math.ceil((useMock ? filtered.length : totalItems) / pageSize));
  const page = Math.min(filters.page, totalPages);
  const pageItems = useMock
    ? filtered.slice((page - 1) * pageSize, page * pageSize)
    : filtered;

  const clearFilters = () => {
    setSearch("");
    setEmployeeFilter("__all__");
    setCompetencyFilter("__all__");
    setFilters(f => ({ ...f, page: 1 }));
  };

  const hasFilters = search || employeeFilter !== "__all__" || competencyFilter !== "__all__";

  const handleDelete = async () => {
    if (!deleteItem) return;
    try {
      await api.delete(`/assessments/${deleteItem.id}`);
      toast.success("Assessment deleted");
    } catch {
      toast.success("Assessment deleted (mock)");
    }
    queryClient.invalidateQueries({ queryKey: ["assessments"] });
    setDeleteItem(null);
  };

  const uniqueEmployees = useMock
    ? [...new Map(MOCK_EMPLOYEES.map(e => [e.id, e])).values()].slice(0, 20)
    : [...new Map(allItems.map(a => [a.employee_id, { id: a.employee_id, name: a.employee_name }])).values()];

  const uniqueCompetencies = useMock
    ? [...new Map(MOCK_COMPETENCIES.map(c => [c.id, c])).values()].slice(0, 20)
    : [...new Map(allItems.map(a => [a.competency_id, { id: a.competency_id, name: a.competency_name }])).values()];

  const startIdx = (page - 1) * pageSize + 1;
  const endIdx = Math.min(page * pageSize, useMock ? filtered.length : totalItems);
  const showTotal = useMock ? filtered.length : totalItems;

  return (
    <AppLayout>
      <div className="space-y-6">
        <PageHeader
          title="Assessments"
          subtitle="Employee competency evaluations"
          actions={
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <ClipboardList className="mr-1.5 h-4 w-4" /> Bulk Assessment
              </Button>
              <Button size="sm" onClick={() => { setEditItem(null); setModalOpen(true); }}>
                <Plus className="mr-1.5 h-4 w-4" /> New Assessment
              </Button>
            </div>
          }
        />

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px] max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search employee or competency..."
              value={search}
              onChange={e => { setSearch(e.target.value); setFilters(f => ({ ...f, page: 1 })); }}
              className="pl-9"
            />
          </div>

          <Select value={employeeFilter} onValueChange={v => { setEmployeeFilter(v); setFilters(f => ({ ...f, page: 1 })); }}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Employees" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">All Employees</SelectItem>
              {uniqueEmployees.map(e => (
                <SelectItem key={e.id} value={e.id}>{"full_name" in e ? e.full_name : (e as any).name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={competencyFilter} onValueChange={v => { setCompetencyFilter(v); setFilters(f => ({ ...f, page: 1 })); }}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Competencies" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">All Competencies</SelectItem>
              {uniqueCompetencies.map(c => (
                <SelectItem key={c.id} value={c.id}>{"name" in c ? c.name : (c as any).name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {hasFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <X className="mr-1 h-3.5 w-3.5" /> Clear
            </Button>
          )}
        </div>

        {/* Table */}
        <div className="rounded-lg border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Competency</TableHead>
                <TableHead>Level</TableHead>
                <TableHead>Assessor</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Notes</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && !useMock ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 8 }).map((_, j) => (
                      <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
                    ))}
                  </TableRow>
                ))
              ) : pageItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-32 text-center text-muted-foreground">
                    No assessments found.
                  </TableCell>
                </TableRow>
              ) : (
                pageItems.map(a => {
                  const cat = a.competency_category || "technical";
                  const catColor = CATEGORY_COLORS[cat] || CATEGORY_COLORS.technical;
                  return (
                    <TableRow key={a.id}>
                      <TableCell className="font-medium">{a.employee_name}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {a.competency_name}
                          <span className={cn("inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium capitalize", catColor)}>
                            {cat.replace("_", " ")}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <LevelIndicator level={a.assessed_level} size="sm" />
                      </TableCell>
                      <TableCell className="text-muted-foreground">{a.assessor_name}</TableCell>
                      <TableCell>
                        <StatusBadge
                          status={a.assessor_type}
                          variant={ASSESSOR_TYPE_COLORS[a.assessor_type] || "default"}
                        />
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {format(new Date(a.assessed_at), "MMM d, yyyy")}
                      </TableCell>
                      <TableCell className="max-w-[180px]">
                        {a.notes ? (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="truncate block text-muted-foreground text-xs cursor-default">
                                {a.notes.length > 40 ? a.notes.slice(0, 40) + "…" : a.notes}
                              </span>
                            </TooltipTrigger>
                            <TooltipContent className="max-w-xs">{a.notes}</TooltipContent>
                          </Tooltip>
                        ) : (
                          <span className="text-muted-foreground/50">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => { setEditItem(a); setModalOpen(true); }}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => setDeleteItem(a)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {startIdx}–{endIdx} of {showTotal}
          </p>
          <div className="flex items-center gap-2">
            <Select
              value={String(pageSize)}
              onValueChange={v => setFilters(f => ({ ...f, page_size: Number(v), page: 1 }))}
            >
              <SelectTrigger className="w-[100px] h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10 / page</SelectItem>
                <SelectItem value="20">20 / page</SelectItem>
                <SelectItem value="50">50 / page</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              disabled={page <= 1}
              onClick={() => setFilters(f => ({ ...f, page: f.page - 1 }))}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm text-muted-foreground tabular-nums">
              {page} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              disabled={page >= totalPages}
              onClick={() => setFilters(f => ({ ...f, page: f.page + 1 }))}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Modals */}
      <AssessmentFormModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        assessment={editItem}
        onSuccess={() => queryClient.invalidateQueries({ queryKey: ["assessments"] })}
      />

      <ConfirmDialog
        open={!!deleteItem}
        onOpenChange={open => !open && setDeleteItem(null)}
        title="Delete Assessment"
        description={`Permanently delete this assessment for "${deleteItem?.employee_name}"?`}
        onConfirm={handleDelete}
        variant="destructive"
      />
    </AppLayout>
  );
}
